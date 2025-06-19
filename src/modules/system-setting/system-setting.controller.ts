import { Body, Controller, Put } from '@nestjs/common'

import { SystemSettingCommandService } from './services/system-setting-command.service'
import { AllowedFileExtensionsDto } from './dtos/AllowedFileExtensions.dto'
import { UpdateDailyLimitUploadsDto } from './dtos/UpdateDailyLimitUploads.dto'

@Controller('admin/system-setting')
export class SystemSettingController {
	constructor(private readonly systemSettingCommandService: SystemSettingCommandService) {}

	@Put('allowed-file')
	async allowedFileExtensions(@Body() dto: AllowedFileExtensionsDto) {
		await this.systemSettingCommandService.allowedFileExtensions(dto)
	}

	@Put('daily-limit-uploads')
	async updateDailyLimitUploads(@Body() dto: UpdateDailyLimitUploadsDto) {
		await this.systemSettingCommandService.updateDailyLimitUploads(dto)
	}
}
