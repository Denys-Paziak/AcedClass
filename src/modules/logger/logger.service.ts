import { Client } from '@elastic/elasticsearch'
import { Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class ElasticLogsInitializerService implements OnModuleInit {
	private readonly client = new Client({
		node: process.env.ELASTICSEARCH_API_NODE
	})

	private readonly POLICY_NAME = 'acedclass-logs-policy'
	private readonly TEMPLATE_NAME = 'acedclass-logs-template'
	private readonly INDEX_ALIAS = 'acedclass-logs'
	private readonly INITIAL_INDEX = 'acedclass-logs-000001'

	async onModuleInit() {
		await this.createILMPolicy()
		await this.createIndexTemplate()
		await this.createInitialIndex()
	}

	private async createILMPolicy() {
		try {
			await this.client.ilm.putLifecycle({
				name: this.POLICY_NAME,
				policy: {
					phases: {
						hot: {
							actions: {
								rollover: {
									max_size: '5gb',
									max_age: '1d'
								}
							}
						},
						warm: {
							min_age: '7d',
							actions: {
								forcemerge: { max_num_segments: 1 },
								shrink: { number_of_shards: 1 },
								set_priority: { priority: 50 }
							}
						},
						delete: {
							min_age: '30d',
							actions: {
								delete: {}
							}
						}
					}
				}
			})
			console.log('✅ ILM policy ensured')
		} catch (e) {
			console.warn('⚠️ Failed to create ILM policy (maybe already exists)', e.meta?.body?.error?.reason || e.message)
		}
	}

	private async createIndexTemplate() {
		try {
			await this.client.indices.putIndexTemplate({
				name: this.TEMPLATE_NAME,
				body: {
					index_patterns: [`${this.INDEX_ALIAS}-*`],
					template: {
						settings: {
							number_of_shards: 1,
							number_of_replicas: 1,
							'index.lifecycle.name': this.POLICY_NAME,
							'index.lifecycle.rollover_alias': this.INDEX_ALIAS
						}
					}
				}
			})
			console.log('✅ Index template ensured')
		} catch (e) {
			console.warn('⚠️ Failed to create index template', e.meta?.body?.error?.reason || e.message)
		}
	}

	private async createInitialIndex() {
		const exists = await this.client.indices.exists({ index: this.INITIAL_INDEX })
		if (!exists) {
			await this.client.indices.create({
				index: this.INITIAL_INDEX,
				body: {
					aliases: {
						[this.INDEX_ALIAS]: { is_write_index: true }
					}
				}
			})
			console.log('✅ Initial index created')
		} else {
			console.log('ℹ️ Initial index already exists')
		}
	}
}
