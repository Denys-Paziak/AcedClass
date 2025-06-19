import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common'
import { Request } from 'express'
import { Response } from 'express'
import { Parser } from 'json2csv'
import { Authorization } from 'src/decorators/auth.decorator'
import { IdParamDto } from 'src/dtos/IdParam.dto'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { AddAdminCommentDto } from '../dtos/AddAdminComment.dto'
import { ChangeStatusComplaintDto } from '../dtos/ChangeStatusComplaint.dto'
import { GetAllComplaintsQueryDto } from '../dtos/GetAllComplaintsQuery.dto'
import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { GetAllComplaintsResponse } from '../responses/GetAllComplaints.response'
import { ComplaintCommandService } from '../services/complaint-command.service'
import { ComplaintQueryService } from '../services/complaint-query.service'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('Complaints Admin')
@Controller('admin/complaints')
export class ComplaintAdminController {
	constructor(
		private readonly complaintQueryService: ComplaintQueryService,
		private readonly complaintCommandService: ComplaintCommandService
	) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('/')
	@ApiOperation({ summary: 'Отримати всі скарги' })
	@ApiResponse({
		status: 200,
		type: GetAllComplaintsResponse,
		description: 'Отримати всі скарги'
	})
	async getAllComplaints(@Query() query: GetAllComplaintsQueryDto): Promise<GetAllComplaintsResponse> {
		return await this.complaintQueryService.getAllComplaints(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Експортувати всі скарги у CSV' })
	@ApiResponse({
		status: 200,
		description: 'Експорт всіх скарг у CSV',
		content: {
			'text/csv': {}
		}
	})
	async getAllComplaintsExportCSV(@Query() query: GetAllComplaintsQueryDto, @Res() res: Response) {
		const data = await this.complaintQueryService.getAllComplaints(query)

		const flattenData = data.page.map(item => ({
			...item,
			author: item.author?.username,
			user: item.user?.username,
			document: item.document?.name
		}))

		const fields = Object.keys(flattenData[0])
		const parser = new Parser({ fields })
		const csv = parser.parse(flattenData)

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader('Content-Disposition', 'attachment; filename=report.csv')
		res.send(csv)
	}

	@Authorization(ERoleNames.ADMIN)
	@Post('/')
	@ApiOperation({ summary: 'Створити нову скаргу' })
	@ApiResponse({
		status: 201,
		description: 'Скарга успішно створена'
	})
	async postComplaint(@Req() request: Request, @Body() dto: PostComplaintDto) {
		const userFromToken = request.user as ITokenUser

		await this.complaintCommandService.postComplaint(userFromToken.id, userFromToken.role, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Змінити статус скарги' })
	@ApiResponse({
		status: 200,
		description: 'Статус скарги успішно змінено'
	})
	async changeStatusComplaint(@Param() params: IdParamDto, @Body() dto: ChangeStatusComplaintDto) {
		await this.complaintCommandService.changeStatusComplaint(params.id, dto.status)
	}

	@Authorization(ERoleNames.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Видалити скаргу' })
	@ApiResponse({
		status: 200,
		description: 'Скарга успішно видалена'
	})
	async deleteComplaint(@Param() params: IdParamDto) {
		await this.complaintCommandService.deleteComplaint(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Додати коментар адміністратора до скарги' })
	@ApiResponse({
		status: 200,
		description: 'Коментар адміністратора успішно додано'
	})
	async addAdminComment(@Param() params: IdParamDto, @Body() dto: AddAdminCommentDto) {
		await this.complaintCommandService.addAdminComment(params.id, dto)
	}
}
