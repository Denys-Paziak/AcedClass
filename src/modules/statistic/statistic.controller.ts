import { Controller, Get, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'
import { Authorization } from '../../decorators/auth.decorator'
import { ERoleNames } from '../../interfaces/ERoleNames'

import { PlatformActivityQueryDto } from './dtos/PlatformActivityQuery.dto'
import { TopUsersQueryDto } from './dtos/TopUsersQuery.dto'
import { PendingApprovalsResponse } from './responses/PendingApprovals.response'
import { PlatformActivityResponse } from './responses/PlatformActivity.response'
import { TopUsersResponse } from './responses/TopUsers.response'
import { StatisticService } from './statistic.service'

@ApiCookieAuth()
@ApiTags('Statistic Admin')
@Controller('admin/statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('activity')
	@ApiOperation({ summary: 'Get statistics on platform activity' })
	@ApiResponse({ status: 200, type: PlatformActivityResponse, description: 'Platform activity statistics' })
	async platformActivity(@Query() query: PlatformActivityQueryDto): Promise<PlatformActivityResponse> {
		return await this.statisticService.platformActivity(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('pending-approvals')
	@ApiOperation({ summary: 'Get the number of documents awaiting verification' })
	@ApiResponse({ status: 200, type: PendingApprovalsResponse, description: 'Number of documents awaiting review' })
	async pendingApprovals(): Promise<PendingApprovalsResponse> {
		return await this.statisticService.pendingApprovals()
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('top-users')
	@ApiOperation({ summary: 'Get the top users' })
	@ApiResponse({ status: 200, type: TopUsersResponse, description: 'Top users' })
	async topUsers(@Query() query: TopUsersQueryDto): Promise<TopUsersResponse> {
		return await this.statisticService.topUsers(query)
	}
}
