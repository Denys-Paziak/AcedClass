import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	ServiceUnavailableException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { addDays, addHours, subHours, subMinutes } from 'date-fns'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { DOCUMENT_DELETION_DELAY_AFTER_REJECTION_DAYS, MIN_DOCUMENTS_TO_EARN_POINTS } from 'src/magic/constants'
import { MailService } from 'src/modules/mail/mail.service'
import { PointCommandService } from 'src/modules/point/services/point-command.service'
import { SystemNotificationSystemService } from 'src/modules/system-notification/services/system-notification-system.service'
import { SystemSettingQueryService } from 'src/modules/system-setting/services/system-setting-query.service'
import { TaskMetodsService } from 'src/modules/task/task-metods.service'
import { UserCommandService } from 'src/modules/user/services/user-command.service'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { DataSource, EntityManager, Repository } from 'typeorm'

import { AccelerationByContributionLevel } from '../../../magic/rules/AccelerationByContributionLevel'
import { getPointsByApprovalRate } from '../../../magic/rules/ApprovalPoints'
import { getContributionLevel } from '../../../magic/rules/ContributionLevels'
import { ChangeInfoDocumentDto } from '../dtos/ChangeInfoDocument.dto'
import { PostDocumentDto } from '../dtos/PostDocument.dto'
import { Document } from '../entities/Document.entity'
import { generateSafeSlug } from 'src/utils/generateSafeSlug.util'

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
		private readonly systemNotificationSystemService: SystemNotificationSystemService,
		private readonly systemSettingQueryService: SystemSettingQueryService,
		private readonly mailService: MailService
	) {}

	async postDocument(userId: number, data: PostDocumentDto, file: Express.Multer.File) {
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: userId } })

		const settings = await this.systemSettingQueryService.getSettings([
			'reveal settings',
			'feature toggles',
			'moderation',
			'notification'
		])

		if (!settings('feature toggles').documentUploading) {
			throw new ServiceUnavailableException('Document uploading is currently disabled by the system.')
		}

		if (userFromDB.uploadBlocking && userFromDB.uploadBlocking > new Date()) {
			throw new ForbiddenException('You are currently blocked from uploading documents.')
		}

		if (userFromDB.availableUploads !== 0) {
			const { defaultDelay, university: universityDelay, course: courseDelay } = settings('reveal settings')

			const documentsCount = await this.documentRepository.count({ where: { user: { id: userId } } })

			let delay = addHours(new Date(), defaultDelay)
			let points = getPointsByApprovalRate(userFromDB.approvalLevel)

			// Врахування додаткової інформації
			if (data.universityId) subHours(delay, (universityDelay.active && universityDelay.delay) || 0)
			if (data.courseName) subHours(delay, (courseDelay.active && courseDelay.delay) || 0)

			// Врахування рівня вкладу
			if (data.courseName) subMinutes(delay, AccelerationByContributionLevel[getContributionLevel(documentsCount)] || 0)

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

				// В майбутньому це перенесеться у вебхук де отримується інформація про обробку документа
				if (!settings('moderation').requaireModeratorApproval) {
					await this.changeStatusHelper(documentFromDB.id, EDocumentStatuses.APPROVED, manager)
				}

				const { adminAlertThreshold, adminAlertInterval, adminNotificationRecipients } = settings('notification')
				const countDocumentPending = await this.documentRepository.count({ where: { status: EDocumentStatuses.PENDING } })
				const excess = countDocumentPending - adminAlertThreshold

				if (excess >= 0) {
					if (excess === 0 || excess % adminAlertInterval === 0) {
						await this.mailService.adminAlert(countDocumentPending, adminNotificationRecipients)
					}
				}

				const systemName = generateSafeSlug(documentFromDB.name) 

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

				if (documentsCount >= MIN_DOCUMENTS_TO_EARN_POINTS) {
					// Додавання відкладеної задачі для нарахування поінтів
					this.taskMetodsService.addPoints(userId, points, documentFromDB.id, delay < new Date() ? new Date() : delay)
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
					await this.taskMetodsService.deleteDocument(
						documentFromDB.id,
						addDays(new Date(), DOCUMENT_DELETION_DELAY_AFTER_REJECTION_DAYS)
					)
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

	async incrementNumberViews(documentId: number) {
		await this.documentRepository
			.createQueryBuilder()
			.update(Document)
			.set({ numberViews: () => `"number_views" + 1` })
			.where('id = :id', { id: documentId })
			.execute()
	}
}
