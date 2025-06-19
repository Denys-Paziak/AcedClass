import { Controller, Get, Query } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'

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
	@ApiOperation({ summary: 'Отримати статистику активності платформи' })
	@ApiResponse({ status: 200, type: PlatformActivityResponse, description: 'Статистика активності платформи' })
	async platformActivity(@Query() query: PlatformActivityQueryDto): Promise<PlatformActivityResponse> {
		return await this.statisticService.platformActivity(query)
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('pending-approvals')
	@ApiOperation({ summary: 'Отримати кількість документів що очікують перевірки' })
	@ApiResponse({ status: 200, type: PendingApprovalsResponse, description: 'Кількість документів що очікують перевірки' })
	async pendingApprovals(): Promise<PendingApprovalsResponse> {
		return await this.statisticService.pendingApprovals()
	}

	@Authorization(ERoleNames.ADMIN)
	@Get('top-users')
	@ApiOperation({ summary: 'Отримати топ користувачів' })
	@ApiResponse({ status: 200, type: TopUsersResponse, description: 'Топ користувачів' })
	async topUsers(@Query() query: TopUsersQueryDto): Promise<TopUsersResponse> {
		return await this.statisticService.topUsers(query)
	}
}
