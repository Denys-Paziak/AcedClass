import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { IdParamDto } from 'src/dtos/IdParam.dto'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { PostMessageContactSupportDto } from '../dtos/PostMessageContactSupport.dto'
import { MessageCommandService } from '../services/message-command.service'
import { MessageQueryService } from '../services/message-query.service'
import { GetMyMessagesResponse } from '../responses/GetMyMessages.response'
import {  ApiCookieAuth, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('Messages')
@Controller('messages')
export class MessageController {
	constructor(
		private readonly messageQueryService: MessageQueryService,
		private readonly messageCommandService: MessageCommandService
	) {}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Отримати мої повідомлення' })
	@ApiResponse({ status: 200, type: [GetMyMessagesResponse], description: 'Список моїх повідомлень' })
	async getMyMessages(@Req() request: Request): Promise<GetMyMessagesResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.messageQueryService.getMyMessages(userFromToken.id)
	}

	@Authorization(ERoleNames.USER)
	@Post('contact-support')
	@ApiOperation({ summary: 'Надіслати повідомлення до служби підтримки' })
	@ApiResponse({ status: 201, description: 'Повідомлення успішно надіслано' })
	async postMessageContactSupport(@Req() request: Request, @Body() dto: PostMessageContactSupportDto) {
		const userFromToken = request.user as ITokenUser

		await this.messageCommandService.postMessageContactSupport(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Delete(':id')
	@ApiOperation({ summary: 'Видалити повідомлення' })
	@ApiResponse({ status: 204, description: 'Повідомлення успішно видалено' })
	async deleteMessage(@Param() param: IdParamDto) {
		await this.messageCommandService.deleteMessage(param.id)
	}
}
