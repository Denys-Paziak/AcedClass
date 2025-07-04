import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Authorization } from '../../../decorators/auth.decorator'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { TopUniversitiesQueryDto } from '../dtos/TopUniversitiesQuery.dto'
import { TopUniversitiesResponse } from '../responses/TopUniversities.response'
import { UniversityService } from '../university.service'

@ApiTags('Universities Admin')
@Controller('admin/university')
export class UniversityAdminController {
	constructor(private readonly universityService: UniversityService) {}

	@Authorization(ERoleNames.ADMIN)
	@Get('top')
	@ApiOperation({ summary: 'Get top universities' })
	@ApiResponse({ status: 200, type: [TopUniversitiesResponse], description: 'List of top universities' })
	async topUniversities(@Query() query: TopUniversitiesQueryDto): Promise<TopUniversitiesResponse[]> {
		return await this.universityService.topUniversities(query)
	}
}
