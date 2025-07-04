import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ISystemSetting } from '../../../interfaces/ISystemSetting'
import { UserCommandService } from '../../../modules/user/services/user-command.service'
import { AllowedFileExtensionsDto } from '../dtos/AllowedFileExtensions.dto'
import { UpdateDailyLimitUploadsDto } from '../dtos/UpdateDailyLimitUploads.dto'
import { UpdateFeatureTogglesDto } from '../dtos/UpdateFeatureToggles.dto'
import { UpdateModerationDto } from '../dtos/UpdateModeration.dto'
import { UpdateNotificationDto } from '../dtos/UpdateNotification.dto'
import { UpdateRevealSettingsDto } from '../dtos/UpdateRevealSettings.dto'
import { SystemSetting } from '../entities/System-setting.entity'

@Injectable()
export class SystemSettingCommandService {
	constructor(
		@InjectRepository(SystemSetting)
		private readonly systemSettingRepository: Repository<SystemSetting>,

		private readonly userCommandService: UserCommandService
	) {}

	async updateAllowedFileExtensions(data: AllowedFileExtensionsDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'allowed file extensions' }
		})

		if (existingSetting?.data.name === 'allowed file extensions') {
			await this.systemSettingRepository.update(
				{ name: 'allowed file extensions' },
				{
					data: {
						name: 'allowed file extensions',
						data: {
							pdf: {
								mime: existingSetting.data.data.pdf.mime,
								allowed: data.pdf?.allowed ?? existingSetting.data.data.pdf.allowed,
								maxSizeMb: data.pdf?.maxSizeMb ?? existingSetting.data.data.pdf.maxSizeMb
							},
							doc: {
								mime: existingSetting.data.data.doc.mime,
								allowed: data.doc?.allowed ?? existingSetting.data.data.doc.allowed,
								maxSizeMb: data.doc?.maxSizeMb ?? existingSetting.data.data.doc.maxSizeMb
							},
							docx: {
								mime: existingSetting.data.data.docx.mime,
								allowed: data.docx?.allowed ?? existingSetting.data.data.docx.allowed,
								maxSizeMb: data.docx?.maxSizeMb ?? existingSetting.data.data.docx.maxSizeMb
							},
							xls: {
								mime: existingSetting.data.data.xls.mime,
								allowed: data.xls?.allowed ?? existingSetting.data.data.xls.allowed,
								maxSizeMb: data.xls?.maxSizeMb ?? existingSetting.data.data.xls.maxSizeMb
							},
							xlsx: {
								mime: existingSetting.data.data.xlsx.mime,
								allowed: data.xlsx?.allowed ?? existingSetting.data.data.xlsx.allowed,
								maxSizeMb: data.xlsx?.maxSizeMb ?? existingSetting.data.data.xlsx.maxSizeMb
							},
							ppt: {
								mime: existingSetting.data.data.ppt.mime,
								allowed: data.ppt?.allowed ?? existingSetting.data.data.ppt.allowed,
								maxSizeMb: data.ppt?.maxSizeMb ?? existingSetting.data.data.ppt.maxSizeMb
							},
							pptx: {
								mime: existingSetting.data.data.pptx.mime,
								allowed: data.pptx?.allowed ?? existingSetting.data.data.pptx.allowed,
								maxSizeMb: data.pptx?.maxSizeMb ?? existingSetting.data.data.pptx.maxSizeMb
							}
						}
					} as ISystemSetting
				}
			)
		}
	}

	async updateDailyLimitUploads(data: UpdateDailyLimitUploadsDto) {
		await this.userCommandService.updateDailyLimitUploadsAllUsers(data.limit)

		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'daily limit uploads' }
		})

		if (existingSetting?.data.name === 'daily limit uploads') {
			await this.systemSettingRepository.update(
				{ name: 'daily limit uploads' },
				{
					data: {
						name: 'daily limit uploads',
						data: {
							limit: data.limit,
							active: data.active
						}
					} as ISystemSetting
				}
			)
		}
	}

	async updateRevealSettings(data: UpdateRevealSettingsDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'reveal settings' }
		})

		if (existingSetting?.data.name === 'reveal settings') {
			await this.systemSettingRepository.update(
				{ name: 'reveal settings' },
				{
					data: {
						name: 'reveal settings',
						data: {
							defaultDelay: data.defaultDelay ?? existingSetting.data.data.defaultDelay,
							university: {
								delay: data.university?.delay ?? existingSetting.data.data.university.delay,
								active: data.university?.active ?? existingSetting.data.data.university.active
							},
							course: {
								delay: data.course?.delay ?? existingSetting.data.data.course.active,
								active: data.course?.active ?? existingSetting.data.data.course.active
							}
						}
					} as ISystemSetting
				}
			)
		}
	}

	async updateFeatureToggles(data: UpdateFeatureTogglesDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'feature toggles' }
		})

		if (existingSetting?.data.name === 'feature toggles') {
			await this.systemSettingRepository.update(
				{ name: 'feature toggles' },
				{
					data: {
						name: 'feature toggles',
						data: {
							contentReporting: data.contentReporting ?? existingSetting.data.data.contentReporting,
							documentRevealing: data.documentRevealing ?? existingSetting.data.data.documentRevealing,
							documentUploading: data.documentUploading ?? existingSetting.data.data.documentUploading,
							votingSystem: data.votingSystem ?? existingSetting.data.data.votingSystem
						}
					} as ISystemSetting
				}
			)
		}
	}

	async updateModeration(data: UpdateModerationDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'moderation' }
		})

		if (existingSetting?.data.name === 'moderation') {
			await this.systemSettingRepository.update(
				{ name: 'moderation' },
				{
					data: {
						name: 'moderation',
						data: {
							requaireModeratorApproval:
								data.requireModeratorApproval ?? existingSetting.data.data.requaireModeratorApproval,
							flaggedThreshold: data.flaggedThreshold ?? existingSetting.data.data.flaggedThreshold,
							rejectedThreshold: data.rejectedThreshold ?? existingSetting.data.data.rejectedThreshold
						}
					} as ISystemSetting
				}
			)
		}
	}

	async updateNotification(data: UpdateNotificationDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'notification' }
		})

		if (existingSetting?.data.name === 'notification') {
			await this.systemSettingRepository.update(
				{ name: 'notification' },
				{
					data: {
						name: 'notification',
						data: {
							adminAlertThreshold: data.adminAlertThreshold ?? existingSetting.data.data.adminAlertThreshold,
							adminAlertInterval: data.adminAlertInterval ?? existingSetting.data.data.adminAlertInterval,
							adminNotificationRecipients:
								data.adminNotificationRecipients ?? existingSetting.data.data.adminNotificationRecipients
						}
					} as ISystemSetting
				}
			)
		}
	}
}
