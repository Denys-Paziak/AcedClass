import { BadRequestException, Injectable } from '@nestjs/common'
import { days } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { TPointSource } from 'src/interfaces/TPointSource'
import { DocumentSystemService } from 'src/modules/document/services/document-system.service'
import { SystemNotificationSystemService } from 'src/modules/system-notification/services/system-notification-system.service'
import { TaskMetodsService } from 'src/modules/task/task-metods.service'
import { User } from 'src/modules/user/entities/User.entity'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm'

import { Point } from '../entities/Point.entity'

@Injectable()
export class PointCommandService {
	constructor(
		@InjectRepository(Point)
		private readonly pointRepository: Repository<Point>,

		private readonly taskMetodsService: TaskMetodsService,
		private readonly documentSystemService: DocumentSystemService,
		private readonly systemNotificationSystemService: SystemNotificationSystemService,
		private readonly userSystemService: UserSystemService
	) {}

	async writeOffPoints(data: { pointType: EPointTypes; quantityPoint: number; userId: User['id'] }, manager?: EntityManager) {
		let { pointType, quantityPoint, userId } = data

		const repo = manager?.getRepository(Point) || this.pointRepository

		const records = await repo
			.createQueryBuilder('point')
			.where('point.user_id = :userId', { userId })
			.andWhere('point.type = :type', { type: pointType })
			.andWhere('point.frozen = :frozen', { frozen: false })
			.orderBy('point.createdAt', 'ASC')
			.getMany()

		if (records.reduce<number>((acc, item) => acc + item.available, 0) < quantityPoint) {
			throw new BadRequestException('Not enough available points')
		}

		const recordIdsUsed: { id: Point['id']; available: Point['available'] }[] = []

		for (let i = 0; i < records.length; i++) {
			quantityPoint -= records[i].available

			if (quantityPoint >= 0) {
				records[i].available = 0
			} else {
				records[i].available = Math.abs(quantityPoint)
			}

			recordIdsUsed.push({
				id: records[i].id,
				available: records[i].available
			})

			if (quantityPoint <= 0) {
				break
			}
		}

		if (recordIdsUsed.length === 0) return

		const updateValues = recordIdsUsed.map(({ id, available }) => `WHEN ${id} THEN ${available}`).join(' ')

		const caseExpression = `CASE id ${updateValues} ELSE available END`

		await repo
			.createQueryBuilder()
			.update(Point)
			.set({
				available: () => caseExpression
			})
			.where('id IN (:...ids)', { ids: recordIdsUsed.map(r => r.id) })
			.execute()
	}

	async addPoints(userId: User['id'], points: number, source: TPointSource, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		const userFromDB = await this.userSystemService.findOne({ where: { id: userId } })

		if (userFromDB) {
			let frozen = false

			if (source.type === 'document') {
				const document = await this.documentSystemService.findOne({ where: { id: source.id } })

				if (!document) return

				if (document.status === EDocumentStatuses.REJECTED) {
					frozen = true
				}
			}

			const { id } = await repo.save({
				type: EPointTypes.POINT,
				user: { id: userId },
				totalEarned: points,
				available: points,
				source,
				frozen
			})

			await this.systemNotificationSystemService.createSystemNotification(
				userId,
				{
					type: ESystemNotificationTypes.ADD_POINTS,
					source,
					pointsId: id,
					totalEarned: points,
					burningDate: new Date(Date.now() + days(30))
				},
				manager
			)

			// створення відкладеної задачі для згорання поінтів через 30 днів
			await this.taskMetodsService.burningPoints(id, days(30))
		}
	}

	async burningPoints(pointsId: number, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		await repo.update(pointsId, { available: 0 })
	}

	async deletePointsBySource(source: { type: 'document'; id: number } | { type: 'evaluation' }, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		await repo
			.createQueryBuilder()
			.delete()
			.from(Point)
			.where('source @> :source', {
				source
			})
			.execute()
	}

	async switchFrozenPoints(documentId: number, status: boolean, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		await repo
			.createQueryBuilder()
			.update(Point)
			.set({
				frozen: status
			})
			.where('point.source = :source', { source: JSON.stringify({ type: 'document', id: documentId }) })
			.execute()
	}
}
