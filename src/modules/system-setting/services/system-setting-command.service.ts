import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserCommandService } from 'src/modules/user/services/user-command.service'
import { Repository } from 'typeorm'

import { AllowedFileExtensionsDto } from '../dtos/AllowedFileExtensions.dto'
import { UpdateDailyLimitUploadsDto } from '../dtos/UpdateDailyLimitUploads.dto'
import { SystemSetting } from '../entities/System-setting.entity'

@Injectable()
export class SystemSettingCommandService {
	constructor(
		@InjectRepository(SystemSetting)
		private readonly systemSettingRepository: Repository<SystemSetting>,

		private readonly userCommandService: UserCommandService
	) {}

	async allowedFileExtensions(data: AllowedFileExtensionsDto) {
		const existingSetting = await this.systemSettingRepository.findOne({
			where: { name: 'allowed file extensions' }
		})

		if (existingSetting?.data.name === 'allowed file extensions') {
			await this.systemSettingRepository.update(
				{ name: 'allowed file extensions' },
				{
					data: {
						...existingSetting.data,
						data: {
							pdf: {
								mime: existingSetting.data.data.pdf.mime,
								allowed: data.pdf?.allowed ?? existingSetting.data.data.pdf.allowed,
								maxSizeMb: data.pdf?.maxSizeMb || existingSetting.data.data.pdf.maxSizeMb
							},
							doc: {
								mime: existingSetting.data.data.doc.mime,
								allowed: data.doc?.allowed ?? existingSetting.data.data.doc.allowed,
								maxSizeMb: data.doc?.maxSizeMb || existingSetting.data.data.doc.maxSizeMb
							},
							docx: {
								mime: existingSetting.data.data.docx.mime,
								allowed: data.docx?.allowed ?? existingSetting.data.data.docx.allowed,
								maxSizeMb: data.docx?.maxSizeMb || existingSetting.data.data.docx.maxSizeMb
							},
							xls: {
								mime: existingSetting.data.data.xls.mime,
								allowed: data.xls?.allowed ?? existingSetting.data.data.xls.allowed,
								maxSizeMb: data.xls?.maxSizeMb || existingSetting.data.data.xls.maxSizeMb
							},
							xlsx: {
								mime: existingSetting.data.data.xlsx.mime,
								allowed: data.xlsx?.allowed ?? existingSetting.data.data.xlsx.allowed,
								maxSizeMb: data.xlsx?.maxSizeMb || existingSetting.data.data.xlsx.maxSizeMb
							},
							ppt: {
								mime: existingSetting.data.data.ppt.mime,
								allowed: data.ppt?.allowed ?? existingSetting.data.data.ppt.allowed,
								maxSizeMb: data.ppt?.maxSizeMb || existingSetting.data.data.ppt.maxSizeMb
							},
							pptx: {
								mime: existingSetting.data.data.pptx.mime,
								allowed: data.pptx?.allowed ?? existingSetting.data.data.pptx.allowed,
								maxSizeMb: data.pptx?.maxSizeMb || existingSetting.data.data.pptx.maxSizeMb
							}
						}
					}
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
							limit: data.limit ? data.limit : existingSetting.data.data.limit,
							active: !!data.limit
						}
					}
				}
			)
		}
	}
}
