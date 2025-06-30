import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutocompleteQueryDto } from './dtos/AutocompleteQuery.dto'
import { SearchQueryDto } from './dtos/SearchQuery.dto'
import { ElasticSearchService } from './elastic-search.service'

@ApiTags('Documents search')
@Controller('search')
export class ElasticSearchController {
	constructor(private readonly elasticSearchService: ElasticSearchService) {}

	@Post('/')
	async postDoc(@Body() dto: { id: string; title: string; course_name: string; university: string; text: string }[]) {
		await this.elasticSearchService.bulkIndexFakeDocs(dto)
	}

	@Get('/')
	@ApiOperation({ summary: 'Отримати всі документи з фільтрацією' })
	@ApiResponse({ status: 200, type: SearchQueryDto })
	async search(@Query() query: SearchQueryDto) {
		return await this.elasticSearchService.fullTextSearch(query)
	}

	@Get('autocomplete')
	@ApiOperation({ summary: 'Отримати всі підсказки для автозаповнення' })
	@ApiResponse({ status: 200, type: AutocompleteQueryDto })
	async autocomplete(@Query() query: AutocompleteQueryDto) {
		return await this.elasticSearchService.autocomplete(query)
	}
}
