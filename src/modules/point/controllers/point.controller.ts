import { Controller, Get, Req } from '@nestjs/common'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { PointQueryService } from '../services/point-query.service'
import { GetMyPointsResponse } from '../responses/GetMyPoints.response'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiCookieAuth()
@ApiTags('Points')
@Controller('points')
export class PointController {
	constructor(
		private readonly pointQueryService: PointQueryService
	) {}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Отримати мої бали' })
	@ApiResponse({ status: 200, type: GetMyPointsResponse, description: 'Список моїх балів' })
	async getMyPoints(@Req() request: Request): Promise<GetMyPointsResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.pointQueryService.getPointsAndReveals(userFromToken.id)
	}
}
