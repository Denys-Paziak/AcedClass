import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	ServiceUnavailableException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { addHours, endOfDay, startOfDay } from 'date-fns'
import { Between, DataSource, Repository } from 'typeorm'

import { EComplaintStatus } from '../../../interfaces/EComplaintStatus'
import { EDocumentStatuses } from '../../../interfaces/EDocumentStatuses'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { AUTO_REJECT_DELAY_HOURS, USER_DAILY_COMPLAINT_LIMIT } from '../../../magic/constants'
import { DocumentCommandService } from '../../../modules/document/services/document-command.service'
import { DocumentSystemService } from '../../../modules/document/services/document-system.service'
import { SystemSettingQueryService } from '../../../modules/system-setting/services/system-setting-query.service'
import { TaskMetodsService } from '../../../modules/task/task-metods.service'
import { AddAdminCommentDto } from '../dtos/AddAdminComment.dto'
import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { Complaint } from '../entities/Complaint.entity'

@Injectable()
export class ComplaintCommandService {
	constructor(
		@InjectRepository(Complaint)
		private readonly complaintRepository: Repository<Complaint>,

		private readonly dataSource: DataSource,

		private readonly documentCommandService: DocumentCommandService,
		private readonly documentSystemService: DocumentSystemService,
		private readonly taskMetodsService: TaskMetodsService,
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	async postComplaint(authorId: number, authorRole: ERoleNames, data: PostComplaintDto) {
		const settings = await this.systemSettingQueryService.getSettings(['feature toggles', 'moderation'])

		const { flaggedThreshold, rejectedThreshold } = settings('moderation')

		if (!settings('feature toggles').contentReporting) {
			throw new ServiceUnavailableException('Writing complaints is currently disabled by the system.')
		}

		if (data?.documentId) {
			const documentFromDB = await this.documentSystemService.findOneAndCheck({
				where: { id: data.documentId }
			})

			if (
				documentFromDB?.status === EDocumentStatuses.REJECTED ||
				documentFromDB?.status === EDocumentStatuses.PROCESSING
			) {
				throw new BadRequestException('You cannot file a complaint about a hidden document.')
			}
		}

		const documentComplaints = await this.complaintRepository.find({
			where: { document: { id: data.documentId }, status: EComplaintStatus.PENDING },
			relations: { author: true }
		})

		if (documentComplaints.find(item => item.author?.id === authorId) && authorRole !== ERoleNames.ADMIN) {
			throw new ConflictException('You can no longer file a complaint about this document at this time.')
		}

		const countUserDailyComplaints = await this.complaintRepository.count({
			where: {
				author: { id: authorId },
				createdAt: Between(startOfDay(new Date()), endOfDay(new Date()))
			}
		})

		if (countUserDailyComplaints === USER_DAILY_COMPLAINT_LIMIT && authorRole !== ERoleNames.ADMIN) {
			throw new ForbiddenException('You have reached the daily complaint limit.')
		}

		await this.dataSource.transaction(async manager => {
			if (data.documentId) {
				if (authorRole === ERoleNames.ADMIN) {
					await this.taskMetodsService.deleteJobAutoRejected(data.documentId)
					await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.REJECTED, manager)
				} else {
					if (documentComplaints.length + 1 >= flaggedThreshold) {
						await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.FLAGGED, manager)
					}
					if (documentComplaints.length + 1 >= rejectedThreshold) {
						await this.taskMetodsService.autoRejected(data.documentId, addHours(new Date(), AUTO_REJECT_DELAY_HOURS))
					}
				}
			}

			await manager.getRepository(Complaint).save({
				flag: data.flag,
				author: { id: authorId },
				message: data.message,
				document: { id: data.documentId },
				user: { id: data.userId }
			})
		})
	}

	async changeStatusComplaint(complaintId: Complaint['id'], status: EComplaintStatus) {
		await this.complaintRepository.update(complaintId, { status })
	}

	async deleteComplaint(complaintId: Complaint['id']) {
		await this.complaintRepository.delete(complaintId)
	}

	async addAdminComment(complaintId: Complaint['id'], data: AddAdminCommentDto) {
		await this.complaintRepository.update(complaintId, { adminComment: data.adminComment })
	}
}
