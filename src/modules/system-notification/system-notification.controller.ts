import { Controller, Get, Req } from '@nestjs/common'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { SystemNotificationQueryService } from './services/system-notification-query.service'
import { GetMySystemNotificationResponse } from './responses/GetMySystemNotification.response'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('System Notifications')
@Controller('system-notification')
export class SystemNotificationController {
	constructor(private readonly systemNotificationQueryService: SystemNotificationQueryService) {}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Get my system notifications' })
	@ApiResponse({ status: 200, type: [GetMySystemNotificationResponse], description: 'List of my system notifications' })
	async getMySystemNotification(@Req() request: Request): Promise<GetMySystemNotificationResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.systemNotificationQueryService.getMySystemNotification(userFromToken.id)
	}
}
