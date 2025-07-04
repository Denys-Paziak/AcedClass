import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { SearchUniversitiesQueryDto } from '../dtos/SearchUniversitiesQuery.dto'
import { TopUniversitiesQueryDto } from '../dtos/TopUniversitiesQuery.dto'
import { SearchUniversitiesResponse } from '../responses/SearchUniversities.response'
import { TopUniversitiesResponse } from '../responses/TopUniversities.response'
import { UniversityService } from '../university.service'

@ApiTags('Universities')
@Controller('university')
export class UniversityController {
	constructor(private readonly universityService: UniversityService) {}

	@Get('search')
	@ApiOperation({ summary: 'Search universities' })
	@ApiResponse({ status: 200, type: [SearchUniversitiesResponse], description: 'List of universities' })
	async searchUniversities(@Query() query: SearchUniversitiesQueryDto): Promise<SearchUniversitiesResponse[]> {
		return await this.universityService.searchUniversities(query)
	}

	@Get('top')
	@ApiOperation({ summary: 'Get top universities' })
	@ApiResponse({ status: 200, type: [TopUniversitiesResponse], description: 'List of top universities' })
	async topUniversities(@Query() query: TopUniversitiesQueryDto): Promise<TopUniversitiesResponse[]> {
		return await this.universityService.topUniversities(query)
	}
}
