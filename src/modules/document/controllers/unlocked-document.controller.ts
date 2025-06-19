import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import {  ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { UnlockDocumentDto } from '../dtos/UnlockDocument.dto'
import { GetMyUnlockedDocumentsResponse } from '../responses/GetMyUnlockedDocuments.response'
import { UnlockedDocumentService } from '../services/unlocked-document.service'

@ApiCookieAuth()
@ApiTags('Unlocked Documents')
@Controller('unlocked-documents')
export class UnlockedDocumentController {
	constructor(private readonly unlockedDocumentService: UnlockedDocumentService) {}

	@Authorization(ERoleNames.USER)
	@Post('unlock')
	@ApiOperation({ summary: 'Розблокувати документ' })
	@ApiResponse({ status: 200, description: 'Документ успішно розблоковано' })
	@ApiResponse({ status: 400, description: 'Недостатньо балів для розблокування документа' })
	@ApiResponse({ status: 404, description: 'Документ не знайдено' })
	async unlockDocument(@Req() request: Request, @Body() dto: UnlockDocumentDto) {
		const userFromToken = request.user as ITokenUser

		await this.unlockedDocumentService.unlockDocument({
			quantityPoint: dto.pointType === EPointTypes.POINT ? 4 : 1,
			pointType: dto.pointType,
			userId: userFromToken.id,
			documentId: dto.documentId
		})
	}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Отримати мої розблоковані документи' })
	@ApiResponse({ status: 200, type: [GetMyUnlockedDocumentsResponse] })
	async getMyUnlockedDocuments(@Req() request: Request): Promise<GetMyUnlockedDocumentsResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.unlockedDocumentService.getMyUnlockedDocuments(userFromToken.id)
	}
}
