import { Controller, Get, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Authorization } from '../../../decorators/auth.decorator'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'

import { GetMyPointsResponse } from '../responses/GetMyPoints.response'
import { PointQueryService } from '../services/point-query.service'

@ApiCookieAuth()
@ApiTags('Points')
@Controller('points')
export class PointController {
	constructor(private readonly pointQueryService: PointQueryService) {}

	@Authorization(ERoleNames.USER)
	@Get('my')
	@ApiOperation({ summary: 'Get my points' })
	@ApiResponse({ status: 200, type: GetMyPointsResponse, description: 'List of my points' })
	async getMyPoints(@Req() request: Request): Promise<GetMyPointsResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.pointQueryService.getPointsAndReveals(userFromToken.id)
	}
}
