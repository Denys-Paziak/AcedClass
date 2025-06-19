import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {  ApiConsumes, ApiCookieAuth, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { memoryStorage } from 'multer'
import { Authorization } from 'src/decorators/auth.decorator'
import { OptionalAuth } from 'src/decorators/optional-auth.decorator'
import { StringParamDto } from 'src/dtos/StringParam.dto'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'
import { FileValidationPipe } from 'src/pipes/FileValidation.pipe'

import { PostDocumentDto } from '../dtos/PostDocument.dto'
import { GetMyDocumentsResponse } from '../responses/GetMyDocuments.response'
import { GetOneDocumentAndRecomendationResponse } from '../responses/GetOneDocumentAndRecomendation.response'
import { DocumentCommandService } from '../services/document-command.service'
import { DocumentQueryService } from '../services/document-query.service'

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
	constructor(
		private readonly documentQueryService: DocumentQueryService,
		private readonly documentCommandService: DocumentCommandService
	) {}

	@OptionalAuth()
	@Get('search/:strParam')
	@ApiOperation({ summary: 'Отримати документ за посиланням та рекомендації' })
	@ApiResponse({ status: 200, type: GetOneDocumentAndRecomendationResponse })
	async getOneDocumentAndRecomendation(
		@Req() request: Request,
		@Param() params: StringParamDto
	): Promise<GetOneDocumentAndRecomendationResponse> {
		const userFromToken = request.user as ITokenUser | undefined

		return await this.documentQueryService.getOneDocumentAndRecomendation(userFromToken?.id, params.strParam)
	}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Отримати мої документи' })
	@ApiResponse({ status: 200, type: [GetMyDocumentsResponse] })
	@ApiCookieAuth()
	async getMyDocuments(@Req() request: Request): Promise<GetMyDocumentsResponse[]> {
		const userFromToken = request.user as ITokenUser

		return await this.documentQueryService.getMyDocuments(userFromToken.id)
	}

	@Authorization(ERoleNames.USER)
	@UseInterceptors(
		FileInterceptor('file', {
			storage: memoryStorage()
		})
	)
	@Post('/')
	@ApiOperation({ summary: 'Додати документ' })
	@ApiResponse({ status: 201, description: 'Документ успішно додано' })
	@ApiCookieAuth()
	@ApiResponse({ status: 422, description: 'Невірний формат файлу' })
	@ApiOperation({ summary: 'Завантажити новий документ' })
	@ApiConsumes('multipart/form-data')
	async postDocument(
		@UploadedFile(FileValidationPipe) file: Express.Multer.File,
		@Req() request: Request,
		@Body() dto: PostDocumentDto
	) {
		const userFromToken = request.user as ITokenUser

		await this.documentCommandService.postDocument(userFromToken.id, dto, file)
	}
}
