import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
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
import { WinstonLogger } from 'src/modules/logger/winston.logger'
import { IdParamDto } from 'src/dtos/IdParam.dto'

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
	private readonly logger = new WinstonLogger()
	
	constructor(
		private readonly documentQueryService: DocumentQueryService,
		private readonly documentCommandService: DocumentCommandService
	) {}

	@OptionalAuth()
	@Get('search/:strParam')
	@ApiOperation({ summary: 'Get document by link and recommendations' })
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
	@ApiOperation({ summary: 'Get my documents' })
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
	@ApiResponse({ status: 201, description: 'Document successfully uploaded' })
	@ApiCookieAuth()
	@ApiResponse({ status: 422, description: 'Invalid file format' })
	@ApiOperation({ summary: 'Upload a new document' })
	@ApiConsumes('multipart/form-data')
	async postDocument(
		@UploadedFile(FileValidationPipe) file: Express.Multer.File,
		@Req() request: Request,
		@Body() dto: PostDocumentDto
	) {
		const userFromToken = request.user as ITokenUser
		const { user, method, originalUrl } = request

		this.logger.log(
			`➡️ Request: ${method} ${originalUrl} `,
			`User: ${(user as ITokenUser)?.id || 'Not Auth'} | Params: {} | Query: {} | Body: ${JSON.stringify({
				courseName: dto.courseName,
				universityId: dto.universityId
			})}`
		)

		await this.documentCommandService.postDocument(userFromToken.id, dto, file)
	}

	@ApiOperation({ summary: 'Increment document view count' })
	@ApiResponse({ status: 201, description: 'View count successfully incremented' })
	@Patch('add-view/:id')
	async addView(@Param() params: IdParamDto) {
		await this.documentCommandService.incrementNumberViews(params.id)
	}
}

