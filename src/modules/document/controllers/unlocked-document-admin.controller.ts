import { Controller, Get, Query, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { Parser } from 'json2csv'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { GetAllUnlocksQueryDto } from '../dtos/GetAllUnlocksQuery.dto'
import { GetAllUnlocksResponse } from '../responses/GetAllUnlocks.response'
import { UnlockedDocumentService } from '../services/unlocked-document.service'

@ApiCookieAuth()
@ApiTags('Unlocked Documents Admin')
@Controller('admin/unlocked-documents')
export class UnlockedDocumentAdminController {
	constructor(private readonly unlockedDocumentService: UnlockedDocumentService) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('/')
	@ApiOperation({ summary: 'Отримати всі розблокування документів з фільтрацією' })
	@ApiResponse({ status: 200, type: GetAllUnlocksResponse, description: 'Список розблокувань документів' })
	async getAllUnlocks(@Query() query: GetAllUnlocksQueryDto): Promise<GetAllUnlocksResponse> {
		return await this.unlockedDocumentService.getAllUnlocks(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Експортувати всі розблокування документів в CSV' })
	@ApiResponse({
		status: 200,
		description: 'CSV файл з усіма розблокуваннями документів',
		content: {
			'text/csv': {}
		}
	})
	async getAllUnlocksExportCSV(@Query() query: GetAllUnlocksQueryDto, @Res() res: Response) {
		const data = await this.unlockedDocumentService.getAllUnlocks(query)

		const flattenData = data.page.map(item => ({
			id: item.id,
			pointType: item.pointType,
			createdAt: item.createdAt,
			username: item.user.username,
			userEmail: item.user.email,
			documentName: item.document.name,
			documentAuthor: item.document.user.username
		}))

		const fields = Object.keys(flattenData[0])
		const parser = new Parser({ fields })
		const csv = parser.parse(flattenData)

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader('Content-Disposition', 'attachment; filename=report.csv')
		res.send(csv)
	}
}
