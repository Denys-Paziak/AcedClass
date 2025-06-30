import { Client } from '@elastic/elasticsearch'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { AUTOCOMPLETE_HINT_LIMIT, AUTOCOMPLETE_LIST_HINTS_LIMIT } from 'src/magic/constants'

import { DocumentQueryService } from '../document/services/document-query.service'

import { AutocompleteQueryDto } from './dtos/AutocompleteQuery.dto'
import { SearchQueryDto } from './dtos/SearchQuery.dto'
import { SearchResponse } from './responses/Search.response'

@Injectable()
export class ElasticSearchService implements OnModuleInit {
	private readonly client = new Client({
		node: process.env.ELASTICSEARCH_API_NODE || '',
		auth: {
			apiKey: process.env.ELASTICSEARCH_API_KEY || ''
		}
	})
	private readonly INDEX = 'documents'

	constructor(private readonly documentQueryService: DocumentQueryService) {}

	async onModuleInit() {
		await this.createIndexIfNotExists()
	}

	private async createIndexIfNotExists() {
		const exists = await this.client.indices.exists({ index: this.INDEX })

		if (!exists) {
			await this.client.indices.create({
				index: this.INDEX,
				body: {
					settings: {
						analysis: {
							tokenizer: {
								autocomplete_tokenizer: {
									type: 'edge_ngram',
									min_gram: 2,
									max_gram: 20,
									token_chars: ['letter', 'digit']
								}
							},
							analyzer: {
								autocomplete_analyzer: {
									type: 'custom',
									tokenizer: 'autocomplete_tokenizer',
									filter: ['lowercase']
								},
								autocomplete_search_analyzer: {
									type: 'custom',
									tokenizer: 'standard',
									filter: ['lowercase']
								}
							}
						}
					},
					mappings: {
						properties: {
							title: {
								type: 'text',
								analyzer: 'autocomplete_analyzer',
								search_analyzer: 'autocomplete_search_analyzer',
								term_vector: 'with_positions_offsets',
								fields: {
									keyword: {
										type: 'text',
										analyzer: 'english'
									}
								}
							},
							course_name: {
								type: 'text',
								analyzer: 'autocomplete_analyzer',
								search_analyzer: 'autocomplete_search_analyzer',
								term_vector: 'with_positions_offsets',
								fields: {
									keyword: {
										type: 'text',
										analyzer: 'english'
									}
								}
							},
							university: {
								type: 'text',
								analyzer: 'autocomplete_analyzer',
								search_analyzer: 'autocomplete_search_analyzer',
								term_vector: 'with_positions_offsets',
								fields: {
									keyword: {
										type: 'text',
										analyzer: 'english'
									}
								}
							},
							text: {
								type: 'text',
								analyzer: 'english'
							}
						}
					}
				}
			})
		}
	}

	async indexDocument(id: string, doc: { title: string; course_name: string; university: string; text: string }) {
		await this.client.index({
			index: this.INDEX,
			id,
			document: doc
		})
	}

	async bulkIndexFakeDocs(
		fakeDocuments: { id: string; title: string; course_name: string; university: string; text: string }[]
	) {
		const body = fakeDocuments.flatMap(doc => [{ index: { _index: this.INDEX, _id: doc.id } }, doc])

		const { errors } = await this.client.bulk({ refresh: true, body })

		if (errors) {
			console.error('Bulk indexing failed')
		} else {
			console.log('Fake documents successfully indexed')
		}
	}

	async autocomplete(query: AutocompleteQueryDto) {
		const response = await this.client.search({
			index: this.INDEX,
			size: 10,
			query: {
				bool: {
					should: [
						{
							multi_match: {
								query: query.search,
								fields: ['title', 'course_name', 'university'],
								boost: 3
							}
						},
						{
							multi_match: {
								query: query.search,
								fields: ['title', 'course_name', 'university'],
								fuzziness: 'AUTO',
								boost: 1
							}
						}
					]
				}
			},
			highlight: {
				fields: {
					title: {},
					course_name: {},
					university: {}
				}
			}
		})

		const results: string[] = []

		for (const hit of response.hits.hits) {
			const highlight = hit.highlight

			if (!highlight) continue
			if (results.length >= AUTOCOMPLETE_LIST_HINTS_LIMIT) break

			for (const [field, fragments] of Object.entries(highlight)) {
				if (results.length >= AUTOCOMPLETE_LIST_HINTS_LIMIT) break
				for (const fragment of fragments as string[]) {
					if (results.length >= AUTOCOMPLETE_LIST_HINTS_LIMIT) break
					const firstEmIndex = fragment.indexOf('<em>')
					const lastEmIndex = fragment.lastIndexOf('</em>') + 5
					if (lastEmIndex === -1) continue

					const sliceStart = fragment.slice(firstEmIndex)
					const spliceHighlight = sliceStart.slice(0, sliceStart.lastIndexOf('</em>') + 5)

					const spliceAutocomplete = sliceStart.slice(sliceStart.lastIndexOf('</em>') + 5)

					let autocomplete: string = ''
					for (const word of spliceAutocomplete.split(' ')) {
						autocomplete += word + ' '

						if (autocomplete.length > AUTOCOMPLETE_HINT_LIMIT) break
					}

					const res = (spliceHighlight + autocomplete.trim()).toLowerCase()

					if (!results.includes(res)) {
						results.push(res)
					}
				}
			}
		}

		return results
	}

	async fullTextSearch(query: SearchQueryDto) {
		let elasticIDs: number[] = []
		if (query.search) {
			const res = await this.client.search<{ id: string }>({
				index: this.INDEX,
				size: 10,
				query: {
					bool: {
						should: [
							{
								multi_match: {
									query: query.search,
									fields: ['title.keyword^4', 'text^3', 'course_name.keyword^2', 'university.keyword^1.5'],
									type: 'best_fields',
									operator: 'or'
								}
							},
							{
								match_phrase: {
									'title.keyword': {
										query: query.search,
										boost: 3
									}
								}
							},
							{
								match_phrase: {
									text: {
										query: query.search,
										boost: 2
									}
								}
							},
							{
								match_phrase: {
									'course_name.keyword': {
										query: query.search,
										boost: 2
									}
								}
							},
							{
								match_phrase: {
									'university.keyword': {
										query: query.search,
										boost: 1.5
									}
								}
							},
							{
								multi_match: {
									query: query.search,
									fields: ['title.keyword^2', 'course_name.keyword^1.5', 'university.keyword^1.2'],
									fuzziness: 'AUTO',
									operator: 'or',
									boost: 0.5
								}
							}
						],
						minimum_should_match: 1
					}
				}
			})

			elasticIDs = res.hits.hits.map(item => Number(item._source?.id)).filter(item => !isNaN(item))
		}

		const { page, total } = await this.documentQueryService.searchDocuments({ ...query, ids: elasticIDs })

		return plainToInstance(
			SearchResponse,
			{ page, total },
			{
				excludeExtraneousValues: true
			}
		)
	}
}
