import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import axios from 'axios'
import { Request } from 'express'
import { memoryStorage } from 'multer'

import { Authorization } from '../../../decorators/auth.decorator'
import { OptionalAuth } from '../../../decorators/optional-auth.decorator'
import { IdParamDto } from '../../../dtos/IdParam.dto'
import { StringParamDto } from '../../../dtos/StringParam.dto'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'
import { WinstonLogger } from '../../../modules/logger/winston.logger'
import { FileValidationPipe } from '../../../pipes/FileValidation.pipe'
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
		private readonly documentCommandService: DocumentCommandService,
		private readonly logger: WinstonLogger
	) {}

	@OptionalAuth()
	@Get(':strParam')
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

	@UseInterceptors(
		FileInterceptor('content_file_url', {
			storage: memoryStorage()
		})
	)
	@Post('webhook')
	@ApiResponse({ status: 201, description: 'Document successfully uploaded' })
	@ApiResponse({ status: 422, description: 'Invalid file format' })
	@ApiOperation({ summary: 'Upload a new document' })
	@ApiConsumes('multipart/form-data')
	async webhook(@UploadedFile() file: Express.Multer.File, @Body() dto: any) {
		await this.documentCommandService.webhook({ ...dto, txt_file: file })
	}

	@UseInterceptors(
		FileInterceptor('file', {
			storage: memoryStorage()
		})
	)
	@Post('test')
	async test(@UploadedFile() file: Express.Multer.File, @Body() dto: any) {
		const form = new FormData()

		form.append(
			'content_file_url',
			new Blob(['Standard concern adult social. Pull cultural surface behind. Local country specific quite.'])
		)
		form.append('status', 'success')
		form.append('reason', 'ok')
		form.append('file_url', 'uploads/53435431231234/giohuer780gh34ipu/5a4a4e39-92ef-45b8-94ca-a59e61066965.pdf')
		form.append('short_file_url', 'uploads/53435431231234/giohuer780gh34ipu/95311729-4d5d-4af5-8657-b9be7d1bac98.pdf')
		form.append('preview_file_url', 'url to png')
		form.append('blured_pages_urls', 'uploads/53435431231234/giohuer780gh34ipu/blurred/blur_3.webp')
		form.append('blured_pages_urls', 'uploads/53435431231234/giohuer780gh34ipu/blurred/blur_3.webp')
		form.append('blured_pages_urls', 'uploads/53435431231234/giohuer780gh34ipu/blurred/blur_3.webp')
		form.append('document_id', dto.document_id)

		await axios.post('http://localhost:3001/documents/webhook', form, {
			maxBodyLength: Infinity,
			maxContentLength: Infinity
		})
	}
}
