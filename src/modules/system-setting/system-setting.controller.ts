import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { AllowedFileExtensionsDto } from './dtos/AllowedFileExtensions.dto'
import { UpdateDailyLimitUploadsDto } from './dtos/UpdateDailyLimitUploads.dto'
import { UpdateFeatureTogglesDto } from './dtos/UpdateFeatureToggles.dto'
import { UpdateModerationDto } from './dtos/UpdateModeration.dto'
import { UpdateNotificationDto } from './dtos/UpdateNotification.dto'
import { UpdateRevealSettingsDto } from './dtos/UpdateRevealSettings.dto'
import { AllowedFileExtensionsResponse } from './responses/AllowedFileExtensions.response'
import { DailyLimitUploadsResponse } from './responses/DailyLimitUploads.response'
import { FeatureTogglesResponse } from './responses/FeatureToggles.response'
import { ModerationSettingsResponse } from './responses/ModerationSettings.response'
import { NotificationSettingsResponse } from './responses/NotificationSettings.response'
import { RevealSettingsResponse } from './responses/RevealSettings.response'
import { SystemSettingCommandService } from './services/system-setting-command.service'
import { SystemSettingQueryService } from './services/system-setting-query.service'

@ApiCookieAuth()
@ApiTags('System Settings')
@Controller('admin/system-setting')
export class SystemSettingController {
	constructor(
		private readonly systemSettingCommandService: SystemSettingCommandService,
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	@Patch('allowed-file')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update allowed file extensions for upload' })
	@ApiResponse({ status: 200, description: 'Settings updated successfully' })
	async updateAllowedFileExtensions(@Body() dto: AllowedFileExtensionsDto) {
		await this.systemSettingCommandService.updateAllowedFileExtensions(dto)
	}

	@Get('allowed-file')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get allowed file extensions' })
	@ApiResponse({ status: 200, type: [AllowedFileExtensionsResponse], description: 'Current allowed file extensions' })
	async getAllowedFileExtensions(): Promise<Record<string, AllowedFileExtensionsResponse>> {
		return (await this.systemSettingQueryService.getSettings(['allowed file extensions']))('allowed file extensions')
	}

	@Patch('daily-limit-uploads')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update daily upload limit for users' })
	@ApiResponse({ status: 200, description: 'Limit updated successfully' })
	async updateDailyLimitUploads(@Body() dto: UpdateDailyLimitUploadsDto) {
		await this.systemSettingCommandService.updateDailyLimitUploads(dto)
	}

	@Get('daily-limit-uploads')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get daily upload limit' })
	@ApiResponse({ status: 200, type: DailyLimitUploadsResponse, description: 'Current daily upload limit' })
	async getDailyLimitUploads(): Promise<DailyLimitUploadsResponse> {
		return (await this.systemSettingQueryService.getSettings(['daily limit uploads']))('daily limit uploads')
	}

	@Patch('reveal-settings')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update document reveal settings' })
	@ApiResponse({ status: 200, description: 'Settings updated successfully' })
	async updateRevealSettings(@Body() dto: UpdateRevealSettingsDto) {
		await this.systemSettingCommandService.updateRevealSettings(dto)
	}

	@Get('reveal-settings')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get document reveal settings' })
	@ApiResponse({ status: 200, type: RevealSettingsResponse, description: 'Current reveal settings' })
	async getRevealSettings(): Promise<RevealSettingsResponse> {
		return (await this.systemSettingQueryService.getSettings(['reveal settings']))('reveal settings')
	}

	@Patch('feature-toggles')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update feature toggles' })
	@ApiResponse({ status: 200, description: 'Permissions updated successfully' })
	async updateFeatureToggles(@Body() dto: UpdateFeatureTogglesDto) {
		await this.systemSettingCommandService.updateFeatureToggles(dto)
	}

	@Get('feature-toggles')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get feature toggles' })
	@ApiResponse({ status: 200, type: FeatureTogglesResponse, description: 'Current permissions' })
	async getFeatureToggles(): Promise<FeatureTogglesResponse> {
		return (await this.systemSettingQueryService.getSettings(['feature toggles']))('feature toggles')
	}

	@Patch('moderation')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update moderation settings' })
	@ApiResponse({ status: 200, description: 'Moderation settings updated successfully' })
	async updateModeration(@Body() dto: UpdateModerationDto) {
		await this.systemSettingCommandService.updateModeration(dto)
	}

	@Get('moderation')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get moderation settings' })
	@ApiResponse({ status: 200, type: ModerationSettingsResponse, description: 'Current moderation settings' })
	async getModeration(): Promise<ModerationSettingsResponse> {
		return (await this.systemSettingQueryService.getSettings(['moderation']))('moderation')
	}

	@Patch('notification')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Update notification settings' })
	@ApiResponse({ status: 200, description: 'Notification settings updated successfully' })
	async updateNotification(@Body() dto: UpdateNotificationDto) {
		await this.systemSettingCommandService.updateNotification(dto)
	}

	@Get('notification')
	@Authorization(ERoleNames.ADMIN)
	@ApiOperation({ summary: 'Get notification settings' })
	@ApiResponse({ status: 200, type: NotificationSettingsResponse, description: 'Current notification settings' })
	async getNotification(): Promise<NotificationSettingsResponse> {
		return (await this.systemSettingQueryService.getSettings(['notification']))('notification')
	}
}
