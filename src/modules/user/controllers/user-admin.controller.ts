import { Body, Controller, Get, Param, Patch, Query, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Parser } from 'json2csv'
import { Authorization } from '../../../decorators/auth.decorator'
import { IdParamDto } from '../../../dtos/IdParam.dto'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'

import { AccountBlockingDto } from '../dtos/AccountBlocking.dto'
import { AllUsersInfoQueryDto } from '../dtos/AllUsersInfoQuery.dto'
import { AllUsersInfoResponse } from '../responses/AllUsersInfo.response'
import { GetSelfResponse } from '../responses/GetSelf.response'
import { GetUserInfoResponse } from '../responses/GetUserInfo.response'
import { UserCommandService } from '../services/user-command.service'
import { UserQueryService } from '../services/user-query.service'

@ApiCookieAuth()
@ApiTags('Users Admin')
@Controller('admin/users')
export class UserAdminController {
	constructor(
		private readonly userQueryService: UserQueryService,
		private readonly userCommandService: UserCommandService
	) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('self')
	@ApiOperation({ summary: 'Get information about self (admin)' })
	@ApiResponse({
		status: 200,
		type: GetSelfResponse,
		description: 'Get information about self (admin)'
	})
	async getSelf(@Req() request: Request): Promise<GetSelfResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.userQueryService.getSelf(userFromToken.id, userFromToken.role)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('/')
	@ApiOperation({ summary: 'Get information about all users' })
	@ApiResponse({
		status: 200,
		type: AllUsersInfoResponse,
		description: 'Get information about all users'
	})
	async allUsersInfo(@Query() query: AllUsersInfoQueryDto): Promise<AllUsersInfoResponse> {
		return await this.userQueryService.getAllUsers(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Export information about all users as CSV' })
	@ApiResponse({
		status: 200,
		description: 'Export information about all users as CSV',
		content: {
			'text/csv': {}
		}
	})
	async allUsersInfoExportCSV(@Query() query: AllUsersInfoQueryDto, @Res() res: Response) {
		const data = await this.userQueryService.getAllUsers(query)

		const fields = Object.keys(data.page[0])
		const parser = new Parser({ fields })
		const csv = parser.parse(data.page)

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader('Content-Disposition', 'attachment; filename=report.csv')
		res.send(csv)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get(':id')
	@ApiOperation({ summary: 'Get user information by ID' })
	@ApiResponse({
		status: 200,
		type: GetUserInfoResponse,
		description: 'Get user information by ID'
	})
	async getUserInfo(@Param() params: IdParamDto): Promise<GetUserInfoResponse> {
		return await this.userQueryService.getUserInfo(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/account-blocking')
	@ApiOperation({ summary: 'Block a user account' })
	@ApiResponse({
		status: 200,
		description: 'User account successfully blocked'
	})
	async accountBlocking(@Param() params: IdParamDto, @Body() dto: AccountBlockingDto) {
		return await this.userCommandService.accountBlocking(params.id, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/account-unblocking')
	@ApiOperation({ summary: 'Unblock a user account' })
	@ApiResponse({
		status: 200,
		description: 'User account successfully unblocked'
	})
	async accountUnblocking(@Param() params: IdParamDto) {
		return await this.userCommandService.accountUnblocking(params.id)
	}
}
