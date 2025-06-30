import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as PgBoss from 'pg-boss'

import { WinstonLogger } from '../logger/winston.logger'

@Injectable()
export class TaskMetodsService implements OnModuleInit, OnModuleDestroy {
	private boss: PgBoss
	private readonly logger = new WinstonLogger()

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
		this.boss.on('error', error => {
			this.logger.error(`🧾 PgBoss Metods internal error`, error.stack, `Error: ${JSON.stringify(error.message || error)}`)
		})

		await this.boss.start()
		this.logger.log('🧾 PgBoss Metods started')
	}

	async onModuleDestroy() {
		this.logger.log('🧾 PgBoss Metods stopping...')
		await this.boss.stop()
		this.logger.log('🧾 PgBoss Metods stopped.')
	}

	async addPoints(userId: number, points: number, documentId: number, startAfter: Date) {
		try {
			await this.boss.send('add-points', { userId, points, documentId }, { startAfter })
			this.logger.log(`🧾 Sent job: add-points `, `userId=${userId}, documentId=${documentId}, startAfter=${startAfter}`)
		} catch (error) {
			this.logger.error('🧾 Failed send job: add-points ', error.stack, `Error: ${JSON.stringify(error.message || error)}`)
			throw error
		}
	}

	async burningPoints(dbRecordId: number, startAfter: Date) {
		try {
			await this.boss.send('burning-points', { dbRecordId }, { startAfter })
			this.logger.log(`🧾 Sent job: burning-points`, `dbRecordId=${dbRecordId}, startAfter=${startAfter}`)
		} catch (error) {
			this.logger.error(
				'🧾 Failed send job: burning-points',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async burningReveals(dbRecordId: number, startAfter: Date) {
		try {
			await this.boss.send('burning-reveals', { dbRecordId }, { startAfter })
			this.logger.log(`🧾 Sent job: burning-reveals`, `dbRecordId=${dbRecordId}, startAfter=${startAfter}`)
		} catch (error) {
			this.logger.error(
				'🧾 Failed send job: burning-reveals',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async deleteJobBurningReveals(dbRecordId: number) {
		try {
			const jobs = await this.boss.fetch<{ dbRecordId: number }>('burning-reveals')
			const job = jobs.find(item => item.data.dbRecordId === dbRecordId)

			if (job) {
				await this.boss.deleteJob('burning-reveals', job.id)
				this.logger.log(`🧾 Deleted job: burning-reveals`, `jobId=${job.id}, dbRecordId=${dbRecordId}`)
			} else {
				this.logger.warn(`🧾 No job found to delete: burning-reveals`, `dbRecordId=${dbRecordId}`)
			}
		} catch (error) {
			this.logger.error(
				'🧾 Failed to delete job: burning-reveals',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async deleteDocument(documentId: number, startAfter: Date) {
		try {
			await this.boss.send('delete-documents', { documentId }, { startAfter })
			this.logger.log(`🧾 Sent job: delete-documents`, `documentId=${documentId}, startAfter=${startAfter}`)
		} catch (error) {
			this.logger.error(
				'🧾 Failed send job: delete-documents',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async deleteJobDeleteDocument(documentId: number) {
		try {
			const jobs = await this.boss.fetch<{ documentId: number }>('delete-documents')
			const job = jobs.find(item => item.data.documentId === documentId)

			if (job) {
				await this.boss.deleteJob('delete-documents', job.id)
				this.logger.log(`🧾 Deleted job: delete-documents`, `jobId=${job.id}, documentId=${documentId}`)
			} else {
				this.logger.warn(`🧾 No job found to delete: delete-documents`, `documentId=${documentId}`)
			}
		} catch (error) {
			this.logger.error(
				'🧾 Failed to delete job: delete-documents',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async autoRejected(documentId: number, startAfter: Date) {
		try {
			const jobs = await this.boss.fetch<{ documentId: number }>('auto-rejected')
			const job = jobs.find(item => item.data.documentId === documentId)

			if (!job) {
				await this.boss.send('auto-rejected', { documentId }, { startAfter })
				this.logger.log(`🧾 Sent job: auto-rejected`, `documentId=${documentId}, startAfter=${startAfter}`)
			} else {
				this.logger.warn(`🧾 Job already exists: auto-rejected`, `documentId=${documentId}`)
			}
		} catch (error) {
			this.logger.error(
				'🧾 Failed send job: auto-rejected',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}

	async deleteJobAutoRejected(documentId: number) {
		try {
			const jobs = await this.boss.fetch<{ documentId: number }>('auto-rejected')
			const job = jobs.find(item => item.data.documentId === documentId)

			if (job) {
				await this.boss.deleteJob('auto-rejected', job.id)
				this.logger.log(`🧾 Deleted job: auto-rejected`, `jobId=${job.id}, documentId=${documentId}`)
			} else {
				this.logger.warn(`🧾 No job found to delete: auto-rejected`, `documentId=${documentId}`)
			}
		} catch (error) {
			this.logger.error(
				'🧾 Failed to delete job: auto-rejected',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
			throw error
		}
	}
}
