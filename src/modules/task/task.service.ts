import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as PgBoss from 'pg-boss'

import { EDocumentStatuses } from '../../interfaces/EDocumentStatuses'
import { DocumentCommandService } from '../document/services/document-command.service'
import { WinstonLogger } from '../logger/winston.logger'
import { PointCommandService } from '../point/services/point-command.service'

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
	private boss: PgBoss

	constructor(
		private readonly configService: ConfigService,
		private readonly pointCommandService: PointCommandService,
		private readonly documentCommandService: DocumentCommandService,
		private readonly logger: WinstonLogger
	) {}

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
		this.boss.on('error', error => {
			this.logger.error(`🧾 PgBoss internal error`, error.stack, `Error: ${JSON.stringify(error.message || error)}`)
		})

		await this.boss.start()
		this.logger.log('🧾 PgBoss started')

		await this.boss.createQueue('add-points')
		await this.boss.createQueue('burning-points')
		await this.boss.createQueue('burning-reveals')
		await this.boss.createQueue('delete-documents')
		await this.boss.createQueue('auto-rejected')

		this.wrapWorker('add-points', async job => {
			const { userId, points, documentId } = job.data as { userId: number; points: number; documentId: number }

			await this.pointCommandService.addPoints(userId, points, { type: 'document', id: documentId })
		})

		this.wrapWorker('burning-points', async job => {
			const { dbRecordId } = job.data as { dbRecordId: number }

			await this.pointCommandService.burningPoints(dbRecordId)
		})

		this.wrapWorker('burning-reveals', async job => {
			const { dbRecordId } = job.data as { dbRecordId: number }

			await this.pointCommandService.burningReveals(dbRecordId)
		})

		this.wrapWorker('delete-documents', async job => {
			const { documentId } = job.data as { documentId: number }

			await this.documentCommandService.deleteDocument(documentId)
		})

		this.wrapWorker('auto-rejected', async job => {
			const { documentId } = job.data as { documentId: number }

			await this.documentCommandService.changeStatus(documentId, EDocumentStatuses.REJECTED)
		})

		this.logger.log('🧾 PgBoss initialized successfully.')
	}

	async onModuleDestroy() {
		this.logger.log('🧾 PgBoss stopping...')
		await this.boss.stop()
		this.logger.log('🧾 PgBoss stopped.')
	}

	wrapWorker(queueName: string, handler: (job: PgBoss.Job<unknown>) => Promise<void>) {
		this.boss.work(queueName, { includeMetadata: true }, async ([job]) => {
			const start = Date.now()
			this.logger.log(
				`🧾 Start job: ${queueName}`,
				JSON.stringify({
					jobId: job.id,
					data: job.data,
					createdOn: job.createdOn,
					retryCount: job.retryCount,
					retryLimit: job.retryLimit,
					label: `queue:${queueName}:start`
				})
			)

			try {
				await handler(job)
				this.logger.log(
					`🧾 Success job: ${queueName}`,
					JSON.stringify({
						jobId: job.id,
						durationMs: Date.now() - start,
						label: `queue:${queueName}:success`
					})
				)
			} catch (error) {
				this.logger.error(
					`🧾 Failed job: ${queueName}`,
					error.stack,
					JSON.stringify({
						jobId: job.id,
						error: `Error: ${JSON.stringify(error.message || error)}`,
						durationMs: Date.now() - start,
						retryCount: job.retryCount,
						label: `queue:${queueName}:fail`
					})
				)
				throw error
			}
		})
	}
}
