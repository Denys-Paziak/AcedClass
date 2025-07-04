import { Client } from '@elastic/elasticsearch'
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	ServiceUnavailableException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import { addDays, addHours, subHours, subMinutes } from 'date-fns'
import * as FormData from 'form-data'
import { Readable } from 'stream'
import { DataSource, EntityManager, Repository } from 'typeorm'

import { EDocumentStatuses } from '../../../interfaces/EDocumentStatuses'
import { ESystemNotificationTypes } from '../../../interfaces/ESystemNotificationTypes'
import { DOCUMENT_DELETION_DELAY_AFTER_REJECTION_DAYS, MIN_DOCUMENTS_TO_EARN_POINTS } from '../../../magic/constants'
import { AccelerationByContributionLevel } from '../../../magic/rules/AccelerationByContributionLevel'
import { getPointsByApprovalRate } from '../../../magic/rules/ApprovalPoints'
import { getContributionLevel } from '../../../magic/rules/ContributionLevels'
import { WinstonLogger } from '../../../modules/logger/winston.logger'
import { MailService } from '../../../modules/mail/mail.service'
import { PointCommandService } from '../../../modules/point/services/point-command.service'
import { SystemNotificationSystemService } from '../../../modules/system-notification/services/system-notification-system.service'
import { SystemSettingQueryService } from '../../../modules/system-setting/services/system-setting-query.service'
import { TaskMetodsService } from '../../../modules/task/task-metods.service'
import { UserCommandService } from '../../../modules/user/services/user-command.service'
import { UserSystemService } from '../../../modules/user/services/user-system.service'
import { generateSafeSlug } from '../../../utils/generateSafeSlug.util'
import { ChangeInfoDocumentDto } from '../dtos/ChangeInfoDocument.dto'
import { PostDocumentDto } from '../dtos/PostDocument.dto'
import { Document } from '../entities/Document.entity'

@Injectable()
export class DocumentCommandService {
	private readonly client = new Client({
		node: process.env.ELASTICSEARCH_API_NODE
	})
	private readonly INDEX = 'documents'

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
		private readonly mailService: MailService,
		private readonly logger: WinstonLogger
	) {}

	async postDocument(userId: number, data: PostDocumentDto, file: Express.Multer.File) {
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: userId } })

		const settings = await this.systemSettingQueryService.getSettings(['feature toggles', 'daily limit uploads'])

		if (!settings('feature toggles').documentUploading) {
			throw new ServiceUnavailableException('Document uploading is currently disabled by the system.')
		}

		if (userFromDB.uploadBlocking && userFromDB.uploadBlocking > new Date()) {
			throw new ForbiddenException('You are currently blocked from uploading documents.')
		}

		if (
			userFromDB.dailyCountUploads === userFromDB.dailyLimitUploads + userFromDB.bonusDailyLimitUploads &&
			settings('daily limit uploads').active
		) {
			throw new BadRequestException('The number of available uploads is currently exhausted')
		}

		const form = new FormData()

		const stream = Readable.from(file.buffer)

		form.append('file', stream, {
			filename: file.originalname,
			contentType: file.mimetype
		})

		form.append('user_id', String(userId))

		await this.dataSource.transaction(async manager => {
			// додавання документу в БД
			const documentFromDB = await manager.getRepository(Document).save({
				name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
				courseName: data.courseName,
				university: { id: data.universityId },
				user: userFromDB,
				linkFile: '',
				systemName: '',
				status: EDocumentStatuses.PROCESSING
			})

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

			form.append('document_id', String(documentFromDB.id))

			// Зменшення ліміту загрузок користувача на 1
			await this.userSystemService.incrementDailyCountUploads(userId, manager)

			// Зменшення лічильника страйку якщо він активний
			await this.userSystemService.decrementStrikeCounter(userId, manager)

			// Перерахунок денного ліміту загрузок
			await this.userCommandService.recalculationDailyLimitUploads(userId, manager)
		})

		// надсилання на api обробки файлів
		await axios.post('http://localhost:3001/documents/test', form, {
			headers: form.getHeaders(),
			maxBodyLength: Infinity,
			maxContentLength: Infinity
		})
	}

	// вебхук на який прийдуть дані про результат обробки файлів
	async webhook({
		status,
		reason,
		file_url,
		short_file_url,
		preview_file_url,
		blured_pages_urls,
		document_id,
		txt_file
	}: {
		status: 'success' | 'failed' | 'flagged'
		reason: string
		file_url: string
		short_file_url: string
		preview_file_url: string
		blured_pages_urls: string[]
		document_id: string
		txt_file: Express.Multer.File
	}) {
		const documentFromDB = await this.documentRepository.findOne({
			where: { id: Number(document_id) },
			relations: { user: true, university: true }
		})

		const settings = await this.systemSettingQueryService.getSettings(['reveal settings', 'moderation', 'notification'])

		const { defaultDelay, university: universityDelay, course: courseDelay } = settings('reveal settings')

		if (documentFromDB) {
			if (status === 'failed') {
				await this.dataSource.transaction(async manager => {
					if (documentFromDB.user) {
						await manager.getRepository(Document).delete(documentFromDB.id)

						// Збільшення ліміту загрузок користувача на 1
						await this.userSystemService.decrementDailyCountUploads(documentFromDB.user.id, manager)

						// Збільшення лічильника страйку якщо він активний
						await this.userSystemService.incrementStrikeCounter(documentFromDB.user.id, manager)

						// Перерахунок денного ліміту загрузок
						await this.userCommandService.recalculationDailyLimitUploads(documentFromDB.user.id, manager)

						await this.systemNotificationSystemService.createSystemNotification(
							documentFromDB.user.id,
							{
								type: ESystemNotificationTypes.PROCESSING_FAILED,
								documentId: documentFromDB.id,
								documentName: documentFromDB.name
							},
							manager
						)
					}
				})
			} else {
				const fileBuffer = txt_file?.buffer
				let fileText = ''

				if (fileBuffer) {
					fileText = fileBuffer.toString('utf-8')
				} else {
					throw new InternalServerErrorException(`No txt_file buffer found for document ID ${documentFromDB.id}`)
				}

				await this.dataSource.transaction(async manager => {
					await manager.getRepository(Document).update(documentFromDB.id, {
						status: EDocumentStatuses.PENDING,
						linkFile: file_url,
						linkPreview: preview_file_url,
						linksBlurFile: blured_pages_urls.join(','),
						linkShortFile: short_file_url,
						processingResult: reason.slice(0, 250),
						description: fileText.slice(0, 250) + '...'
					})

					if (!settings('moderation').requaireModeratorApproval) {
						await this.changeStatusHelper(documentFromDB.id, EDocumentStatuses.APPROVED, manager)
					} else {
						try {
							this.adminAlert(settings('notification'))
						} catch (err) {
							this.logger.error(
								`❌ Error admin alert: [${err.status || 500}]`,
								err.stack,
								`Error: ${JSON.stringify(err.message || err)}`
							)
						}
					}
				})

				if (documentFromDB.user) {
					const documentsCount = await this.documentRepository.count({
						where: { user: { id: documentFromDB.user.id } }
					})

					let delay = addHours(new Date(), defaultDelay)
					let points = getPointsByApprovalRate(documentFromDB.user.approvalLevel)

					// Врахування додаткової інформації
					if (documentFromDB.university?.id) {
						delay = subHours(delay, (universityDelay.active && universityDelay.delay) || 0)
					}

					if (documentFromDB.courseName) {
						delay = subHours(delay, (courseDelay.active && courseDelay.delay) || 0)
					}

					// Врахування рівня вкладу
					if (documentFromDB.courseName) {
						delay = subMinutes(delay, AccelerationByContributionLevel[getContributionLevel(documentsCount)] || 0)
					}

					if (documentsCount >= MIN_DOCUMENTS_TO_EARN_POINTS) {
						// Додавання відкладеної задачі для нарахування поінтів
						this.taskMetodsService.addPoints(
							documentFromDB.user.id,
							points,
							documentFromDB.id,
							delay < new Date() ? new Date() : delay
						)
					}
				}

				await this.client.index({
					index: this.INDEX,
					id: String(documentFromDB.id),
					document: {
						title: documentFromDB.name,
						course_name: documentFromDB.courseName,
						university: documentFromDB.university?.name,
						text: fileText,
						status: documentFromDB.status
					}
				})
			}
		}
	}

	private async adminAlert({
		adminAlertThreshold,
		adminAlertInterval,
		adminNotificationRecipients
	}: {
		adminAlertThreshold: number
		adminAlertInterval: number
		adminNotificationRecipients: string[]
	}) {
		const countDocumentPending = await this.documentRepository.count({
			where: { status: EDocumentStatuses.PENDING }
		})
		const excess = countDocumentPending - adminAlertThreshold

		if (excess >= 0) {
			if (excess === 0 || excess % adminAlertInterval === 0) {
				await this.mailService.adminAlert(countDocumentPending, adminNotificationRecipients)
			}
		}
	}

	async changeInfo(documentId: number, data: ChangeInfoDocumentDto) {
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

		let university: string | undefined = undefined

		if (data.universityId) {
			const documentFromDb = await this.documentRepository.findOne({ where: { id: documentId }, relations: { university: true } })

			university = documentFromDb?.university?.name
		}

		await this.client.update({
			index: this.INDEX,
			id: String(documentId),
			doc: Object.assign(
				{
					title: data.name,
					course_name: data.courseName
				},
				university ? { university } : {}
			)
		})
	}

	async changeStatus(documentId: number, status: EDocumentStatuses, manager?: EntityManager) {
		if (manager) {
			await this.changeStatusHelper(documentId, status, manager)
		} else {
			await this.dataSource.transaction(async manager => {
				await this.changeStatusHelper(documentId, status, manager)
			})
		}
	}

	private async changeStatusHelper(documentId: number, status: EDocumentStatuses, manager: EntityManager) {
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
							documentId: documentFromDB.id,
							documentName: documentFromDB.name
						},
						manager
					)
				}

				if (status === EDocumentStatuses.REJECTED) {
					await this.taskMetodsService.deleteDocument(
						documentFromDB.id,
						addDays(new Date(), DOCUMENT_DELETION_DELAY_AFTER_REJECTION_DAYS)
					)
				}
				if (documentFromDB.status === EDocumentStatuses.REJECTED && status !== EDocumentStatuses.REJECTED) {
					await this.taskMetodsService.deleteJobDeleteDocument(documentFromDB.id)
				}
				await this.taskMetodsService.deleteJobAutoRejected(documentFromDB.id)
			}

			await this.client.update({
				index: this.INDEX,
				id: String(documentId),
				doc: {
					status
				}
			})
		}
	}

	async deleteDocument(documentId: number) {
		const documentFromDB = await this.documentRepository.findOneBy({ id: documentId })

		if (documentFromDB) {
			await this.dataSource.transaction(async manager => {
				await manager.getRepository(Document).delete(documentId)
				if (documentFromDB?.user?.id) {
					await this.userCommandService.recalculationApprovalLevel(documentFromDB.user.id, manager)
				}
				await this.client.delete({
					index: this.INDEX,
					id: String(documentId)
				})
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
