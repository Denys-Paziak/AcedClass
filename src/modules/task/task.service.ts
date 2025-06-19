import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as PgBoss from 'pg-boss'

import { Document } from '../document/entities/Document.entity'
import { DocumentCommandService } from '../document/services/document-command.service'
import { PointCommandService } from '../point/services/point-command.service'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
	private boss: PgBoss

	constructor(
		private readonly configService: ConfigService,
		private readonly pointCommandService: PointCommandService,
		private readonly documentCommandService: DocumentCommandService,
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
		await this.boss.start()

		this.boss.on('error', console.error)

		await this.boss.createQueue('add-points')
		await this.boss.createQueue('burning-points')
		await this.boss.createQueue('delete-documents')
		await this.boss.createQueue('auto-rejected')

		await this.boss.work('add-points', async ([job]) => {
			const { userId, points, documentId } = job.data as { userId: number; points: number; documentId: Document['id'] }

			await this.pointCommandService.addPoints(userId, points, {type: 'document', id: documentId})
		})

		await this.boss.work('burning-points', async ([job]) => {
			const { dbRecordId } = job.data as { dbRecordId: number }

			await this.pointCommandService.burningPoints(dbRecordId)
		})

		await this.boss.work('delete-documents', async ([job]) => {
			const { documentId } = job.data as { documentId: number }

			await this.documentCommandService.deleteDocument(documentId)
		})

		await this.boss.work('auto-rejected', async ([job]) => {
			const { documentId } = job.data as { documentId: number }

			await this.documentCommandService.changeStatus(documentId, EDocumentStatuses.REJECTED)
		})
	}

	async onModuleDestroy() {
		await this.boss.stop()
	}
}
