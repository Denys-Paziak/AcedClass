import { Body, Controller, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { PostMessageDto } from '../dtos/PostMessage.dto'
import { MessageCommandService } from '../services/message-command.service'
import {  ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('Messages Admin')
@Controller('admin/messages')
export class MessageAdminController {
	constructor(private readonly messageCommandService: MessageCommandService) {}
	// Це повідомлення яке адмін може надіслати користувачу
	@Authorization(ERoleNames.ADMIN)
	@Post('/')
	@ApiOperation({ summary: 'Надіслати повідомлення користувачу' })
	@ApiResponse({ status: 201, description: 'Повідомлення успішно надіслано' })
	async postMessage(@Req() request: Request, @Body() dto: PostMessageDto) {
		const userFromToken = request.user as ITokenUser

		await this.messageCommandService.postMessage(userFromToken.id, dto)
	}
}
