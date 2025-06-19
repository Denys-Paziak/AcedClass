import { Controller, Get, Query } from '@nestjs/common'

import { UniversityService } from '../university.service'
import { SearchUniversitiesQueryDto } from '../dtos/SearchUniversitiesQuery.dto'
import { TopUniversitiesQueryDto } from '../dtos/TopUniversitiesQuery.dto'
import { SearchUniversitiesResponse } from '../responses/SearchUniversities.response'
import { TopUniversitiesResponse } from '../responses/TopUniversities.response'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Universities')
@Controller('university')
export class UniversityController {
	constructor(private readonly universityService: UniversityService) {}

	@Get('search')
	@ApiOperation({ summary: 'Пошук університетів' })
	@ApiResponse({ status: 200, type: [SearchUniversitiesResponse], description: 'Список університетів' })
	async searchUniversities(@Query() query: SearchUniversitiesQueryDto): Promise<SearchUniversitiesResponse[]> {
		return await this.universityService.searchUniversities(query)
	}

	@Get('top')
	@ApiOperation({ summary: 'Отримати топ університетів' })
	@ApiResponse({ status: 200, type: [TopUniversitiesResponse], description: 'Топ університетів' })
	async topUniversities(@Query() query: TopUniversitiesQueryDto): Promise<TopUniversitiesResponse[]> {
		return await this.universityService.topUniversities(query)
	}
}
