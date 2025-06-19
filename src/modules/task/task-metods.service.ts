import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as PgBoss from 'pg-boss'

import { User } from '../user/entities/User.entity'

@Injectable()
export class TaskMetodsService implements OnModuleInit, OnModuleDestroy {
	private boss: PgBoss

	constructor(private readonly configService: ConfigService) {}

	async onModuleInit() {
		this.boss = new PgBoss({
			connectionString:
				'postgres://' +
				this.configService.getOrThrow<string>('POSTGRES_USER') +
				':' +
				this.configService.getOrThrow<string>('POSTGRES_PASSWORD') +
				'@' +
				this.configService.getOrThrow<string>('POSTGRES_HOST') +
				':' +
				this.configService.getOrThrow<string>('POSTGRES_PORT') +
				'/' +
				this.configService.getOrThrow<string>('POSTGRES_DB')
		})
		await this.boss.start()
	}

	async onModuleDestroy() {
		await this.boss.stop()
	}

	async addPoints(userId: number, points: number, documentId: number, delayS: number) {
		await this.boss.send('add-points', { userId, points, documentId }, { startAfter: delayS / 1000 })
	}

	async burningPoints(dbRecordId: number, delayS: number) {
		await this.boss.send('burning-points', { dbRecordId }, { startAfter: delayS / 1000 })
	}

	async deleteDocument(documentId: number, delayS: number) {
		await this.boss.send('delete-documents', { documentId }, { startAfter: delayS / 1000 })
	}

	async deleteJobDeleteDocument(documentId: number) {
		const jobs = await this.boss.fetch<{ documentId: number }>('delete-documents')

		const job = jobs.find(item => item.data.documentId === documentId)

		if (job) {
			this.boss.deleteJob('delete-documents', job.id)
		}
	}

	async autoRejected(documentId: number, delayS: number) {
		const jobs = await this.boss.fetch<{ documentId: number }>('auto-rejected')

		const job = jobs.find(item => item.data.documentId === documentId)

		if (!job) {
			await this.boss.send('auto-rejected', { documentId }, { startAfter: delayS / 1000 })
		}
	}

	async deleteJobAutoRejected(documentId: number) {
		const jobs = await this.boss.fetch<{ documentId: number }>('auto-rejected')

		const job = jobs.find(item => item.data.documentId === documentId)

		if (job) {
			this.boss.deleteJob('auto-rejected', job.id)
		}
	}
}
