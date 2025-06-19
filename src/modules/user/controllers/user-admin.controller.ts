import { Body, Controller, Get, Param, Patch, Query, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Response } from 'express'
import { Parser } from 'json2csv'
import { Authorization } from 'src/decorators/auth.decorator'
import { IdParamDto } from 'src/dtos/IdParam.dto'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

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
	@ApiOperation({ summary: 'Отримати інформацію про себе (адміністратор)' })
	@ApiResponse({
		status: 200,
		type: GetSelfResponse,
		description: 'Отримати інформацію про себе (адміністратор)'
	})
	async getSelf(@Req() request: Request): Promise<GetSelfResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.userQueryService.getSelf(userFromToken.id, userFromToken.role)
	}
	
	@Authorization(ERoleNames.ADMIN)
	@Get('/')
	@ApiOperation({ summary: 'Отримати інформацію про всіх користувачів' })
	@ApiResponse({
		status: 200,
		type: AllUsersInfoResponse,
		description: 'Отримати інформацію про всіх користувачів'
	})
	async allUsersInfo(@Query() query: AllUsersInfoQueryDto): Promise<AllUsersInfoResponse> {
		return await this.userQueryService.getAllUsers(query)
	}
	
	@Authorization(ERoleNames.ADMIN)
	@Get('export-csv')
	@ApiOperation({ summary: 'Експортувати інформацію про всіх користувачів у CSV' })
	@ApiResponse({
		status: 200,
		description: 'Експорт інформації про всіх користувачів у CSV',
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
	@ApiOperation({ summary: 'Отримати інформацію про користувача за ID' })
	@ApiResponse({
		status: 200,
		type: GetUserInfoResponse,
		description: 'Отримати інформацію про користувача за ID'
	})
	async getUserInfo(@Param() params: IdParamDto): Promise<GetUserInfoResponse> {
		return await this.userQueryService.getUserInfo(params.id)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/account-blocking')
	@ApiOperation({ summary: 'Заблокувати акаунт користувача' })
	@ApiResponse({
		status: 200,
		description: 'Акаунт користувача успішно заблоковано',
	})
	async accountBlocking(@Param() params: IdParamDto, @Body() dto: AccountBlockingDto) {
		return await this.userCommandService.accountBlocking(params.id, dto)
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch(':id/account-unblocking')
	@ApiOperation({ summary: 'Розблокувати акаунт користувача' })
	@ApiResponse({
		status: 200,
		description: 'Акаунт користувача успішно розблоковано',
	})
	async accountUnblocking(@Param() params: IdParamDto) {
		return await this.userCommandService.accountUnblocking(params.id)
	}
}
