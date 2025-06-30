import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { addDays, addMonths } from 'date-fns'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ESubscriptionStatuses } from 'src/interfaces/ESubscriptionStatuses'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { TPointSource } from 'src/interfaces/TPointSource'
import { TRevealSource } from 'src/interfaces/TRevealSource'
import { DocumentSystemService } from 'src/modules/document/services/document-system.service'
import { SystemNotificationSystemService } from 'src/modules/system-notification/services/system-notification-system.service'
import { TaskMetodsService } from 'src/modules/task/task-metods.service'
import { User } from 'src/modules/user/entities/User.entity'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { DataSource, EntityManager, FindOptionsWhere, Repository } from 'typeorm'

import { Point } from '../entities/Point.entity'
import { POINT_EXPIRATION_DAYS, REVEALS_EXPIRATION_MONTHS, SUBSCRIPTION_REVEALS_AMOUNT } from 'src/magic/constants'

@Injectable()
export class PointCommandService {
	constructor(
		@InjectRepository(Point)
		private readonly pointRepository: Repository<Point>,
		private readonly dataSource: DataSource,

		private readonly taskMetodsService: TaskMetodsService,
		private readonly documentSystemService: DocumentSystemService,
		private readonly systemNotificationSystemService: SystemNotificationSystemService,
		private readonly userSystemService: UserSystemService
	) {}

	async writeOffPoints(data: { pointType: EPointTypes; quantityPoint: number; userId: number }, manager?: EntityManager) {
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

	async addPoints(userId: number, points: number, source: TPointSource, manager?: EntityManager) {
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

			const burningDate = addDays(new Date(), POINT_EXPIRATION_DAYS)

			await this.systemNotificationSystemService.createSystemNotification(
				userId,
				{
					type: ESystemNotificationTypes.ADD_POINTS,
					source,
					pointsId: id,
					totalEarned: points,
					burningDate: burningDate
				},
				manager
			)

			await this.taskMetodsService.burningPoints(id, burningDate)
		}
	}

	async addReveals(options: FindOptionsWhere<User>, reveals: number, source: TRevealSource, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		const userFromDB = await this.userSystemService.findOne({ where: options })

		if (userFromDB) {
			const { id } = await repo.save({
				type: EPointTypes.REVEAL,
				user: { id: userFromDB.id },
				totalEarned: reveals,
				available: reveals,
				source
			})

			const burningDate = addMonths(new Date(), REVEALS_EXPIRATION_MONTHS)

			await this.systemNotificationSystemService.createSystemNotification(
				userFromDB.id,
				{
					type: ESystemNotificationTypes.ADD_REVEALS,
					source,
					pointsId: id,
					totalEarned: reveals,
					burningDate: burningDate
				},
				manager
			)

			await this.taskMetodsService.burningReveals(id, burningDate)
		}
	}

	async burningPoints(pointsId: number) {
		await this.pointRepository.update(pointsId, { available: 0 })
	}

	async burningReveals(revealsId: number) {
		await this.dataSource.transaction(async manager => {
			await manager.getRepository(Point).update(revealsId, { available: 0 })

			const userFromDB = (await this.pointRepository.findOne({ where: { id: revealsId }, relations: { user: true } }))?.user

			if (
				userFromDB &&
				(userFromDB.subscribedStatus === ESubscriptionStatuses.ACTIVE ||
					userFromDB.subscribedStatus === ESubscriptionStatuses.PAST_DUE)
			) {
				await this.addReveals({ id: userFromDB.id }, SUBSCRIPTION_REVEALS_AMOUNT, { type: 'subscription' }, manager)
			}
		})
	}

	async burningAllUserReveals(where: FindOptionsWhere<User>, manager?: EntityManager) {
		const repo = manager?.getRepository(Point) || this.pointRepository

		const record = await repo.findOne({ where: { type: EPointTypes.REVEAL, user: where } })

		if (record) {
			repo.update({ id: record.id }, { available: 0 })
			await this.taskMetodsService.deleteJobBurningReveals(record.id)
		}
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
