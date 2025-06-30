import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { UnlockDocumentDto } from '../dtos/UnlockDocument.dto'
import { GetMyUnlockedDocumentsResponse } from '../responses/GetMyUnlockedDocuments.response'
import { UnlockedDocumentService } from '../services/unlocked-document.service'
import { POINTS_TO_UNLOCK_DOCUMENT, REVEALS_TO_UNLOCK_DOCUMENT } from 'src/magic/constants'

@ApiCookieAuth()
@ApiTags('Unlocked Documents')
@Controller('unlocked-documents')
export class UnlockedDocumentController {
	constructor(private readonly unlockedDocumentService: UnlockedDocumentService) {}

	@Authorization(ERoleNames.USER)
	@Post('unlock')
	@ApiOperation({ summary: 'Unlock a document' })
	@ApiResponse({ status: 200, description: 'Document successfully unlocked' })
	@ApiResponse({ status: 400, description: 'Not enough points to unlock the document' })
	@ApiResponse({ status: 404, description: 'Document not found' })
	async unlockDocument(@Req() request: Request, @Body() dto: UnlockDocumentDto) {
		const userFromToken = request.user as ITokenUser

		await this.unlockedDocumentService.unlockDocument({
			quantityPoint: dto.pointType === EPointTypes.POINT ? POINTS_TO_UNLOCK_DOCUMENT : REVEALS_TO_UNLOCK_DOCUMENT,
			pointType: dto.pointType,
			userId: userFromToken.id,
			documentId: dto.documentId
		})
	}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Get my unlocked documents' })
	@ApiResponse({ status: 200, type: [GetMyUnlockedDocumentsResponse] })
	async getMyUnlockedDocuments(@Req() request: Request): Promise<GetMyUnlockedDocumentsResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.unlockedDocumentService.getMyUnlockedDocuments(userFromToken.id)
	}
}
