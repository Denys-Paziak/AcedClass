import { Injectable } from '@nestjs/common'
import { days } from '@nestjs/throttler'
import { plainToInstance } from 'class-transformer'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITopUser } from 'src/interfaces/ITopUser'
import { POINTS_TO_UNLOCK_DOCUMENT, REVEALS_TO_UNLOCK_DOCUMENT } from 'src/magic/constants'
import { Document } from 'src/modules/document/entities/Document.entity'
import { UnlockedDocument } from 'src/modules/document/entities/Unlocked-document.entity'
import { DocumentSystemService } from 'src/modules/document/services/document-system.service'
import { UnlockedDocumentService } from 'src/modules/document/services/unlocked-document.service'
import { Point } from 'src/modules/point/entities/Point.entity'
import { User } from 'src/modules/user/entities/User.entity'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { DataSource, MoreThan } from 'typeorm'

import { PlatformActivityQueryDto } from './dtos/PlatformActivityQuery.dto'
import { TopUsersQueryDto } from './dtos/TopUsersQuery.dto'
import { PendingApprovalsResponse } from './responses/PendingApprovals.response'
import { PlatformActivityResponse } from './responses/PlatformActivity.response'
import { TopUsersResponse } from './responses/TopUsers.response'

@Injectable()
export class StatisticService {
	constructor(
		private readonly userSystemService: UserSystemService,
		private readonly documentSystemService: DocumentSystemService,
		private readonly unlockedDocumentService: UnlockedDocumentService,
		private readonly dataSource: DataSource
	) {}

	async platformActivity(query: PlatformActivityQueryDto) {
		const now = new Date()
		const currentRangeStart = new Date(now.getTime() - days(query.rangeDays))

		const [
			growthUsers,
			currentUsers,
			growthUploaded,
			currentUploaded,
			growthRevealed,
			currentRevealed,
			growthPointsUsedCount,
			currentPointsUsedCount,
			growthRevealsUsed,
			currentRevealsUsed
		] = await Promise.all([
			this.userSystemService.count({ where: { role: ERoleNames.USER, createdAt: MoreThan(currentRangeStart) } }),
			this.userSystemService.count({ where: { role: ERoleNames.USER } }),

			this.documentSystemService.count({ where: { createdAt: MoreThan(currentRangeStart) } }),
			this.documentSystemService.count(),

			this.unlockedDocumentService.count({ where: { createdAt: MoreThan(currentRangeStart) } }),
			this.unlockedDocumentService.count(),

			this.unlockedDocumentService.count({
				where: {
					createdAt: MoreThan(currentRangeStart),
					pointType: EPointTypes.POINT
				}
			}),
			this.unlockedDocumentService.count({
				where: {
					pointType: EPointTypes.POINT
				}
			}),

			this.unlockedDocumentService.count({
				where: {
					createdAt: MoreThan(currentRangeStart),
					pointType: EPointTypes.REVEAL
				}
			}),
			this.unlockedDocumentService.count({
				where: {
					pointType: EPointTypes.REVEAL
				}
			})
		])

		const calculateGrowth = (current: number, previous: number) => ((current - previous) / (previous || 1)) * 100

		return plainToInstance(
			PlatformActivityResponse,
			{
				users: {
					total: currentUsers,
					growth: growthUsers,
					growthPercent: calculateGrowth(currentUsers, currentUsers - growthUsers)
				},
				uploaded: {
					total: currentUploaded,
					growth: growthUploaded,
					growthPercent: calculateGrowth(currentUploaded, currentUploaded - growthUploaded)
				},
				revealed: {
					total: currentRevealed,
					growth: growthRevealed,
					growthPercent: calculateGrowth(currentRevealed, currentRevealed - growthRevealed)
				},
				pointsUsed: {
					total: currentPointsUsedCount * POINTS_TO_UNLOCK_DOCUMENT,
					growth: growthPointsUsedCount * POINTS_TO_UNLOCK_DOCUMENT,
					growthPercent:
						calculateGrowth(currentPointsUsedCount, currentPointsUsedCount - growthPointsUsedCount) *
						POINTS_TO_UNLOCK_DOCUMENT
				},
				revealsUsed: {
					total: currentRevealsUsed * REVEALS_TO_UNLOCK_DOCUMENT,
					growth: growthRevealsUsed * REVEALS_TO_UNLOCK_DOCUMENT,
					growthPercent:
						calculateGrowth(currentRevealsUsed, currentRevealsUsed - growthRevealsUsed) * REVEALS_TO_UNLOCK_DOCUMENT
				}
			},
			{
				excludeExtraneousValues: true
			}
		)
	}

	async pendingApprovals() {
		const count = await this.documentSystemService.count({ where: { status: EDocumentStatuses.PENDING } })

		return plainToInstance(PendingApprovalsResponse, count, {
			excludeExtraneousValues: true
		})
	}

	async topUsers(query: TopUsersQueryDto) {
		const range = new Date(Date.now() - days(query.rangeDays))

		const totalUsers = await this.userSystemService.count({ where: { role: ERoleNames.USER } })

		const documentsSubQuery = this.dataSource
			.getRepository(Document)
			.createQueryBuilder('document')
			.select('document.user_id', 'userId')
			.addSelect('COUNT(document.id)', 'docCount')
			.where('document.created_at >= :range', { range })
			.groupBy('document.user_id')

		const unlockedDocumentsSubQuery = this.dataSource
			.getRepository(UnlockedDocument)
			.createQueryBuilder('unlocked')
			.select('unlocked.user_id', 'userId')
			.addSelect('COUNT(unlocked.id)', 'unlockedDocCount')
			.where('unlocked.point_type = :pointType')
			.andWhere('unlocked.created_at >= :range')
			.groupBy('unlocked.user_id')

		const pointsSubQuery = this.dataSource
			.getRepository(Point)
			.createQueryBuilder('point')
			.select('point.user_id', 'userId')
			.addSelect('COALESCE(SUM(point.total_earned), 0)', 'totalEarnedSum')
			.where('point.type = :type')
			.andWhere('point.created_at >= :range')
			.groupBy('point.user_id')

		const qb = this.dataSource
			.getRepository(User)
			.createQueryBuilder('user')
			.select(['user.id', 'user.username', 'user.last_activity'])
			.where('user.role = :role')
			.leftJoin('(' + documentsSubQuery.getQuery() + ')', 'documents', 'documents."userId" = user.id')
			.leftJoin('(' + unlockedDocumentsSubQuery.getQuery() + ')', 'unlocked', 'unlocked."userId" = user.id')
			.leftJoin('(' + pointsSubQuery.getQuery() + ')', 'points', 'points."userId" = user.id')
			.setParameters({ role: ERoleNames.USER, range, type: EPointTypes.POINT, pointType: EPointTypes.POINT })
			.addSelect('COALESCE(documents."docCount", 0)', 'docCount')
			.addSelect('COALESCE(points."totalEarnedSum", 0)', 'totalEarnedSum')
			.addSelect('COALESCE(unlocked."unlockedDocCount", 0)', 'unlockedDocCount')
			.orderBy('"docCount"', 'DESC')
			.addOrderBy('"totalEarnedSum"', 'DESC')
			.addOrderBy('last_activity', 'DESC')
			.limit(query.limit || 5)
			.offset((query.limit || 5) * ((query.page || 1) - 1))

		const rawResults = await qb.getRawMany()

		const top = rawResults.map(item => ({
			id: item.user_id,
			username: item.user_username,
			docCount: Number(item.docCount),
			totalEarnedSum: Number(item.totalEarnedSum),
			usedSum: Number(item.unlockedDocCount) * POINTS_TO_UNLOCK_DOCUMENT,
			lastActivity: item.last_activity
		})) as ITopUser[]

		return plainToInstance(
			TopUsersResponse,
			{
				page: top,
				total: totalUsers
			},
			{
				excludeExtraneousValues: true
			}
		)
	}
}
