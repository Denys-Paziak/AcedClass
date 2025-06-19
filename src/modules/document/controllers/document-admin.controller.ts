import { Body, Controller, Delete, Get, Param, Patch, Query, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation,   ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { Parser } from 'json2csv'
import { Authorization } from 'src/decorators/auth.decorator'
import { IdParamDto } from 'src/dtos/IdParam.dto'
import { ERoleNames } from 'src/interfaces/ERoleNames'

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
	@ApiOperation({ summary: 'Отримати всі документи з фільтрацією' })
	@ApiResponse({ status: 200, type: GetAllDocumentsResponse })
	async getAllDocuments(@Query() query: GetAllDocumentsQueryDto): Promise<GetAllDocumentsResponse> {
		return await this.documentQueryService.getAllDocuments(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Експортувати всі документи в CSV' })
	@ApiResponse({
		status: 200,
		description: 'CSV файл з усіма документами',
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
	@ApiOperation({ summary: 'Отримати документ за ID' })
	@ApiResponse({ status: 200, type: GetOneDocumentReponse })
	@ApiResponse({ status: 404, description: 'Документ не знайдено' })
	async getOneDocument(@Param() params: IdParamDto): Promise<GetOneDocumentReponse> {
		return await this.documentQueryService.getOneDocument(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/change-info')
	@ApiOperation({ summary: 'Змінити інформацію про документ' })
	@ApiResponse({ status: 200, description: 'Інформація про документ успішно змінена' })
	@ApiResponse({ status: 404, description: 'Документ не знайдено' })
	async changeInfoDocument(@Param() params: IdParamDto, @Body() dto: ChangeInfoDocumentDto) {
		return await this.documentCommandService.changeInfo(params.id, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/change-status')
	@ApiOperation({ summary: 'Змінити статус документа' })
	@ApiResponse({ status: 200, description: 'Статус документа успішно змінено' })
	@ApiResponse({ status: 404, description: 'Документ не знайдено' })
	async changeStatusDocument(@Param() params: IdParamDto, @Body() dto: ChangeStatusDocumentDto) {
		this.documentCommandService.changeStatus(params.id, dto.status)
	}

	@Authorization(ERoleNames.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Видалити документ' })
	@ApiResponse({ status: 200, description: 'Документ успішно видалено' })
	async deleteDocument(@Param() param: IdParamDto) {
		this.documentCommandService.deleteDocument(param.id)
	}
}
