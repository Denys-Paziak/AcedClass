import { Body, Controller, Delete, Get, Param, Patch, Query, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { Parser } from 'json2csv'

import { Authorization } from '../../../decorators/auth.decorator'
import { IdParamDto } from '../../../dtos/IdParam.dto'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ChangeInfoDocumentDto } from '../dtos/ChangeInfoDocument.dto'
import { ChangeStatusDocumentDto } from '../dtos/ChangeStatusDocument.dto'
import { GetAllDocumentsQueryDto } from '../dtos/GetAllDocumentsQuery.dto'
import { GetAllDocumentsResponse } from '../responses/GetAllDocuments.response'
import { GetOneDocumentReponse } from '../responses/GetOneDocument.response'
import { DocumentCommandService } from '../services/document-command.service'
import { DocumentQueryService } from '../services/document-query.service'

@ApiCookieAuth()
@ApiTags('Documents Admin')
@Controller('admin/documents')
export class DocumentAdminController {
	constructor(
		private readonly documentQueryService: DocumentQueryService,
		private readonly documentCommandService: DocumentCommandService
	) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('/')
	@ApiOperation({ summary: 'Get all documents with filtering' })
	@ApiResponse({ status: 200, type: GetAllDocumentsResponse })
	async getAllDocuments(@Query() query: GetAllDocumentsQueryDto): Promise<GetAllDocumentsResponse> {
		return await this.documentQueryService.getAllDocuments(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Export all documents to CSV' })
	@ApiResponse({
		status: 200,
		description: 'CSV file with all documents',
		content: {
			'text/csv': {}
		}
	})
	async getAllDocumentsExportCSV(@Query() query: GetAllDocumentsQueryDto, @Res() res: Response) {
		const data = await this.documentQueryService.getAllDocuments(query)

		const flattenData = data.page.map(item => ({
			...item,
			university: item.university.name
		}))

		const fields = Object.keys(flattenData[0])
		const parser = new Parser({ fields })
		const csv = parser.parse(flattenData)

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader('Content-Disposition', 'attachment; filename=report.csv')
		res.send(csv)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get(':id')
	@ApiOperation({ summary: 'Get document by ID' })
	@ApiResponse({ status: 200, type: GetOneDocumentReponse })
	@ApiResponse({ status: 404, description: 'Document not found' })
	async getOneDocument(@Param() params: IdParamDto): Promise<GetOneDocumentReponse> {
		return await this.documentQueryService.getOneDocument(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/change-info')
	@ApiOperation({ summary: 'Update document information' })
	@ApiResponse({ status: 200, description: 'Document information successfully updated' })
	@ApiResponse({ status: 404, description: 'Document not found' })
	async changeInfoDocument(@Param() params: IdParamDto, @Body() dto: ChangeInfoDocumentDto) {
		return await this.documentCommandService.changeInfo(params.id, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/change-status')
	@ApiOperation({ summary: 'Change document status' })
	@ApiResponse({ status: 200, description: 'Document status successfully changed' })
	@ApiResponse({ status: 404, description: 'Document not found' })
	async changeStatusDocument(@Param() params: IdParamDto, @Body() dto: ChangeStatusDocumentDto) {
		this.documentCommandService.changeStatus(params.id, dto.status)
	}

	@Authorization(ERoleNames.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Delete document' })
	@ApiResponse({ status: 200, description: 'Document successfully deleted' })
	async deleteDocument(@Param() param: IdParamDto) {
		this.documentCommandService.deleteDocument(param.id)
	}
}
