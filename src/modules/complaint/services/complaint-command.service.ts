import { ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { DocumentCommandService } from 'src/modules/document/services/document-command.service'
import { TaskMetodsService } from 'src/modules/task/task-metods.service'
import { User } from 'src/modules/user/entities/User.entity'
import { DataSource, Repository } from 'typeorm'

import { AddAdminCommentDto } from '../dtos/AddAdminComment.dto'
import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { Complaint } from '../entities/Complaint.entity'
import { EComplaintStatus } from 'src/interfaces/EComplaintStatus'
import { SystemSettingQueryService } from 'src/modules/system-setting/services/system-setting-query.service'
import { addHours } from 'date-fns'
import { AUTO_REJECT_DELAY_HOURS } from 'src/magic/constants'

@Injectable()
export class ComplaintCommandService {
	constructor(
		@InjectRepository(Complaint)
		private readonly complaintRepository: Repository<Complaint>,

		private readonly dataSource: DataSource,

		private readonly documentCommandService: DocumentCommandService,
		private readonly taskMetodsService: TaskMetodsService,
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	async postComplaint(authorId: User['id'], authorRole: User['role'], data: PostComplaintDto) {
		const settings = await this.systemSettingQueryService.getSettings(['feature toggles', 'moderation'])
					
		const {falaggedThreshold, rejectedThreshold} = settings('moderation')

		if (!settings('feature toggles').contentReporting) {
			throw new ServiceUnavailableException('Writing complaints is currently disabled by the system.')
		}

		await this.dataSource.transaction(async manager => {
			if (data.documentId) {
				const documentComplaints = await manager.getRepository(Complaint).find({
					where: { document: { id: data.documentId }, status: EComplaintStatus.PENDING }
				})

				if (!documentComplaints.find(item => item.author?.id === authorId)) {
					if (authorRole === ERoleNames.ADMIN) {
						await this.taskMetodsService.deleteJobAutoRejected(data.documentId)
						await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.REJECTED, manager)
					} else {
						if (documentComplaints.length + 1 === falaggedThreshold) {
							await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.FLAGGED, manager)
						}

						if (documentComplaints.length + 1 === rejectedThreshold) {
							await this.taskMetodsService.autoRejected(data.documentId, addHours(new Date(), AUTO_REJECT_DELAY_HOURS))
						}
					}
					await manager.getRepository(Complaint).save({
						flag: data.flag,
						author: { id: authorId },
						message: data.message,
						document: { id: data.documentId },
						user: { id: data.userId }
					})
				} else {
					throw new ConflictException('You can no longer file a complaint about this document at this time.')
				}
			}
		})
	}

	async changeStatusComplaint(complaintId: Complaint['id'], status: EComplaintStatus) {
		await this.dataSource.transaction(async manager => {
			await manager.getRepository(Complaint).update(complaintId, { status })

			if (status === EComplaintStatus.RESOLVED) {
				const complaint = await manager
					.getRepository(Complaint)
					.findOne({ where: { id: complaintId }, relations: { document: true } })
	
				if (complaint?.document?.id) {
					const documentComplaints = await manager.getRepository(Complaint).find({
						where: { document: { id: complaint.document.id }, status: EComplaintStatus.PENDING }
					})
	
					if (documentComplaints.length === 0) {
						await this.documentCommandService.changeStatus(complaint.document.id, EDocumentStatuses.PENDING, manager)
						await this.taskMetodsService.deleteJobAutoRejected(complaint.document.id)
					}
				}
			}
		})
	}

	async deleteComplaint(complaintId: Complaint['id']) {
		await this.complaintRepository.delete(complaintId)
	}

	async addAdminComment(complaintId: Complaint['id'], data: AddAdminCommentDto) {
		await this.complaintRepository.update(complaintId, { adminComment: data.adminComment })
	}
}
