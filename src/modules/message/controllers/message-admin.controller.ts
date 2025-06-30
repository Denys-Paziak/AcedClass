import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { AdminSendEmailToUsersDto } from '../dtos/AdminSendEmailToUsers.dto'
import { PostMessageDto } from '../dtos/PostMessage.dto'
import { MessageCommandService } from '../services/message-command.service'

@ApiCookieAuth()
@ApiTags('Messages Admin')
@Controller('admin/messages')
export class MessageAdminController {
	constructor(private readonly messageCommandService: MessageCommandService) {}
	// Це повідомлення яке адмін може надіслати користувачу в його сповіщення на сайті
	@Authorization(ERoleNames.ADMIN)
	@Post('/')
	@ApiOperation({ summary: 'Send a message to the user in their notification' })
	@ApiResponse({ status: 201, description: 'Message sent successfully' })
	async postMessage(@Req() request: Request, @Body() dto: PostMessageDto) {
		const userFromToken = request.user as ITokenUser

		await this.messageCommandService.postMessage(userFromToken.id, dto)
	}

	// Це повідомлення яке адмін може надіслати користувачам на пошту
	@Authorization(ERoleNames.ADMIN)
	@Post('mailing')
	@ApiOperation({ summary: 'Send a message to users by email' })
	@ApiResponse({ status: 201, description: 'Message sent successfully' })
	async adminSendEmailToUsers(@Body() dto: AdminSendEmailToUsersDto) {
		await this.messageCommandService.adminSendEmailToUsers(dto)
	}
}
