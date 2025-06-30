import { Body, Controller, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { EvaluationDocumentDto } from './dtos/EvaluationDocument.dto'
import { EvaluationService } from './evaluation.service'
import {  ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('Evaluations')
@Controller('evaluations')
export class EvaluationController {
	constructor(private readonly evaluationService: EvaluationService) {}

	@Authorization(ERoleNames.USER)
	@Post('/')
	@ApiOperation({ summary: 'Evaluation of the document' })
	@ApiResponse({ status: 201, description: 'The document has been successfully evaluated' })
	@ApiResponse({ status: 400, description: 'Incorrect data for document evaluation' })
	async evaluationDocument(@Req() request: Request, @Body() dto: EvaluationDocumentDto) {
		const userFromToken = request.user as ITokenUser

		await this.evaluationService.evaluationDocument(userFromToken.id, dto)
	}
}
