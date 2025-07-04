import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { Authorization } from '../../../decorators/auth.decorator'
import { IdParamDto } from '../../../dtos/IdParam.dto'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'
import { PostMessageContactSupportDto } from '../dtos/PostMessageContactSupport.dto'
import { GetMyMessagesResponse } from '../responses/GetMyMessages.response'
import { MessageCommandService } from '../services/message-command.service'
import { MessageQueryService } from '../services/message-query.service'

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
	@ApiOperation({ summary: 'Receive my messages' })
	@ApiResponse({ status: 200, type: [GetMyMessagesResponse], description: 'List of my messages' })
	async getMyMessages(@Req() request: Request): Promise<GetMyMessagesResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.messageQueryService.getMyMessages(userFromToken.id)
	}

	@Authorization(ERoleNames.USER)
	@Post('contact-support')
	@ApiOperation({ summary: 'Send a message to the support team' })
	@ApiResponse({ status: 201, description: 'Message sent successfully' })
	async postMessageContactSupport(@Req() request: Request, @Body() dto: PostMessageContactSupportDto) {
		const userFromToken = request.user as ITokenUser

		await this.messageCommandService.postMessageContactSupport(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a message' })
	@ApiResponse({ status: 204, description: 'Message successfully deleted' })
	async deleteMessage(@Param() param: IdParamDto) {
		await this.messageCommandService.deleteMessage(param.id)
	}
}
