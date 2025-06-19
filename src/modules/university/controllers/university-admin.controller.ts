import { Controller, Get, Query } from '@nestjs/common'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { TopUniversitiesQueryDto } from '../dtos/TopUniversitiesQuery.dto'
import { TopUniversitiesResponse } from '../responses/TopUniversities.response'
import { UniversityService } from '../university.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Universities Admin')
@Controller('admin/university')
export class UniversityAdminController {
	constructor(private readonly universityService: UniversityService) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('top')
	@ApiOperation({ summary: 'Отримати топ університетів' })
	@ApiResponse({ status: 200, type: [TopUniversitiesResponse], description: 'Топ університетів' })
	async topUniversities(@Query() query: TopUniversitiesQueryDto): Promise<TopUniversitiesResponse[]> {
		return await this.universityService.topUniversities(query)
	}
}
