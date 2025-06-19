import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { days, hours, minutes, seconds } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { PointCommandService } from 'src/modules/point/services/point-command.service'
import { SystemNotificationSystemService } from 'src/modules/system-notification/services/system-notification-system.service'
import { TaskMetodsService } from 'src/modules/task/task-metods.service'
import { User } from 'src/modules/user/entities/User.entity'
import { UserCommandService } from 'src/modules/user/services/user-command.service'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { DataSource, EntityManager, Repository } from 'typeorm'

import { ChangeInfoDocumentDto } from '../dtos/ChangeInfoDocument.dto'
import { PostDocumentDto } from '../dtos/PostDocument.dto'
import { Document } from '../entities/Document.entity'
import { AccelerationByContributionLevel } from '../rules/AccelerationByContributionLevel'
import { getPointsByApprovalRate } from '../rules/ApprovalPoints'
import { getContributionLevel } from '../rules/ContributionLevels'

@Injectable()
export class DocumentCommandService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepository: Repository<Document>,

		private readonly dataSource: DataSource,

		private readonly taskMetodsService: TaskMetodsService,
		private readonly userCommandService: UserCommandService,
		private readonly userSystemService: UserSystemService,
		private readonly pointCommandService: PointCommandService,
		private readonly systemNotificationSystemService: SystemNotificationSystemService
	) {}

	async postDocument(userId: User['id'], data: PostDocumentDto, file: Express.Multer.File) {
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: userId } })

		if (userFromDB.uploadBlocking && userFromDB.uploadBlocking > new Date()) {
			throw new ForbiddenException('You are currently blocked from uploading documents.')
		}

		if (userFromDB.availableUploads !== 0) {
			const documentsCount = await this.documentRepository.count({ where: { user: { id: userId } } })

			let delay = hours(24)
			let points = 4

			// Врахування додаткової інформації
			if (data.universityId ) delay -= hours(11.5)
			if (data.courseName) delay -= hours(11.5)

			// Врахування рівня вкладу
			delay -= minutes(AccelerationByContributionLevel[getContributionLevel(documentsCount)] || 0)

			points = getPointsByApprovalRate(userFromDB.approvalLevel)

			await this.dataSource.transaction(async manager => {
				// додавання документу в БД
				const documentFromDB = await manager.getRepository(Document).save({
					name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
					courseName: data.courseName,
					university: { id: data.universityId },
					user: userFromDB,
					linkFile: '',
					systemName: ''
				})

				const systemName = documentFromDB.name.replace(/[ _]/g, '-').replace(/[^\p{L}\p{N}\-]/gu, '')

				if (await manager.getRepository(Document).findOneBy({ systemName })) {
					await manager.getRepository(Document).update(documentFromDB.id, {
						systemName: systemName + '-' + documentFromDB.id
					})
				} else {
					await manager.getRepository(Document).update(documentFromDB.id, {
						systemName
					})
				}

				// Зменшення ліміту загрузок користувача на 1
				await this.userSystemService.decrementAvailableUploads(userId, manager)

				// Перерахунок денного ліміту загрузок
				await this.userCommandService.recalculationDailyLimitUploads(userId, manager)

				// Зменшення лічильника страйку якщо він активний
				await this.userSystemService.decrementStrikeCounter(userId, manager)
				
				if (documentsCount >= 4) {
					// Додавання відкладеної задачі для нарахування поінтів
					this.taskMetodsService.addPoints(userId, points, documentFromDB.id,  delay)
				}
			})
		} else {
			throw new BadRequestException('The number of available uploads is currently exhausted')
		}
	}

	async changeInfo(documentId: Document['id'], data: ChangeInfoDocumentDto) {
		const systemName = data?.name?.replace(' ', '-').replace(/[^a-zA-Z0-9-]/g, '')

		const result = await this.documentRepository.update(documentId, {
			name: data.name,
			courseName: data.courseName,
			university: { id: data.universityId },
			systemName: systemName ? systemName + documentId : undefined
		})

		if (result.affected === 0) {
			throw new NotFoundException('No such document found')
		}
	}

	async changeStatus(documentId: Document['id'], status: EDocumentStatuses, manager?: EntityManager) {
		if (manager) {
			await this.changeStatusHelper(documentId, status, manager)
		} else {
			await this.dataSource.transaction(async manager => {
				await this.changeStatusHelper(documentId, status, manager)
			})
		}
	}

	private async changeStatusHelper(documentId: Document['id'], status: EDocumentStatuses, manager: EntityManager) {
		const documentFromDB = await manager
			.getRepository(Document)
			.findOne({ where: { id: documentId }, relations: { user: true } })

		if (documentFromDB?.status !== status) {
			await manager.getRepository(Document).update(documentId, { status })

			if (documentFromDB?.user?.id) {
				await this.userCommandService.recalculationApprovalLevel(documentFromDB.user.id, manager)
				if ([EDocumentStatuses.REJECTED, EDocumentStatuses.APPROVED].includes(status)) {
					await this.pointCommandService.switchFrozenPoints(
						documentFromDB.id,
						EDocumentStatuses.REJECTED === status,
						manager
					)
				}

				if ([EDocumentStatuses.REJECTED, EDocumentStatuses.APPROVED, EDocumentStatuses.FLAGGED].includes(status)) {
					await this.systemNotificationSystemService.createSystemNotification(
						documentFromDB.user.id,
						{
							type:
								status === EDocumentStatuses.APPROVED
									? ESystemNotificationTypes.FILE_APPROVED
									: status === EDocumentStatuses.REJECTED
										? ESystemNotificationTypes.FILE_REJECTED
										: ESystemNotificationTypes.FILE_FLAGGED,
							documentId: documentFromDB.id
						},
						manager
					)
				}

				if (status === EDocumentStatuses.REJECTED) {
					await this.taskMetodsService.deleteDocument(documentFromDB.id, days(180))
				} else {
					await this.taskMetodsService.deleteJobDeleteDocument(documentFromDB.id)
				}
			}
		}
	}

	async deleteDocument(documentId: Document['id']) {
		const documentFromDB = await this.documentRepository.findOneBy({ id: documentId })

		if (documentFromDB) {
			await this.dataSource.transaction(async manager => {
				await manager.getRepository(Document).delete(documentId)
				if (documentFromDB?.user?.id) {
					await this.userCommandService.recalculationApprovalLevel(documentFromDB.user.id, manager)
				}
			})
		} else {
			throw new NotFoundException('No such document found.')
		}
	}
}
