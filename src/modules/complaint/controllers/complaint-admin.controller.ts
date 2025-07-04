import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Response } from 'express'
import { Parser } from 'json2csv'

import { Authorization } from '../../../decorators/auth.decorator'
import { IdParamDto } from '../../../dtos/IdParam.dto'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'
import { AddAdminCommentDto } from '../dtos/AddAdminComment.dto'
import { ChangeStatusComplaintDto } from '../dtos/ChangeStatusComplaint.dto'
import { GetAllComplaintsQueryDto } from '../dtos/GetAllComplaintsQuery.dto'
import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { GetAllComplaintsResponse } from '../responses/GetAllComplaints.response'
import { ComplaintCommandService } from '../services/complaint-command.service'
import { ComplaintQueryService } from '../services/complaint-query.service'

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
	@ApiOperation({ summary: 'Receive all complaints' })
	@ApiResponse({
		status: 200,
		type: GetAllComplaintsResponse,
		description: 'Complaints successfully received'
	})
	async getAllComplaints(@Query() query: GetAllComplaintsQueryDto): Promise<GetAllComplaintsResponse> {
		return await this.complaintQueryService.getAllComplaints(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Export all complaints to CSV' })
	@ApiResponse({
		status: 200,
		description: 'Successfully exported to CSV',
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
	@ApiOperation({ summary: 'Create a new complaint' })
	@ApiResponse({
		status: 201,
		description: 'Complaint successfully created'
	})
	async postComplaint(@Req() request: Request, @Body() dto: PostComplaintDto) {
		const userFromToken = request.user as ITokenUser

		await this.complaintCommandService.postComplaint(userFromToken.id, userFromToken.role, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: 'Change the status of a complaint' })
	@ApiResponse({
		status: 200,
		description: 'Complaint status successfully changed'
	})
	async changeStatusComplaint(@Param() params: IdParamDto, @Body() dto: ChangeStatusComplaintDto) {
		await this.complaintCommandService.changeStatusComplaint(params.id, dto.status)
	}

	@Authorization(ERoleNames.ADMIN)
	@Delete(':id')
	@ApiOperation({ summary: 'Delete the complaint' })
	@ApiResponse({
		status: 200,
		description: 'Complaint successfully removed'
	})
	async deleteComplaint(@Param() params: IdParamDto) {
		await this.complaintCommandService.deleteComplaint(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id')
	@ApiOperation({ summary: "Add an administrator's comment to the complaint" })
	@ApiResponse({
		status: 200,
		description: 'Administrator comment successfully added'
	})
	async addAdminComment(@Param() params: IdParamDto, @Body() dto: AddAdminCommentDto) {
		await this.complaintCommandService.addAdminComment(params.id, dto)
	}
}
