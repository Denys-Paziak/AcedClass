import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { days } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { Document } from 'src/modules/document/entities/Document.entity'
import { Point } from 'src/modules/point/entities/Point.entity'
import Stripe from 'stripe'
import { Brackets, Repository } from 'typeorm'

import { AllUsersInfoQueryDto } from '../dtos/AllUsersInfoQuery.dto'
import { User } from '../entities/User.entity'
import { AllUsersInfoResponse } from '../responses/AllUsersInfo.response'
import { GetSelfResponse } from '../responses/GetSelf.response'
import { GetUserInfoResponse } from '../responses/GetUserInfo.response'

@Injectable()
export class UserQueryService {
	private stripe: Stripe

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		private readonly configService: ConfigService
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	async getSelf(userId: number, userRole: ERoleNames) {
		const userFromDB = await this.userRepository.findOne({ where: { id: userId, role: userRole } })
		if (!userFromDB) throw new NotFoundException('No such user found')

		await this.userRepository.update(userId, { lastActivity: new Date() })

		const price = userFromDB.subscription
			? await this.stripe.prices.retrieve(userFromDB.subscription, {
					expand: ['product']
				})
			: null

		return plainToInstance(
			GetSelfResponse,
			{
				...userFromDB,
				subscription: price
					? {
							id: price.id,
							price: price.unit_amount ? price.unit_amount / 100 : 0,
							currency: price.currency,
							period: {
								interval: price.recurring?.interval,
								count: price.recurring?.interval_count
							},
							name: (price.product as Stripe.Product).name
						}
					: null
			},
			{
				excludeExtraneousValues: true
			}
		)
	}

	async getAllUsers(query: AllUsersInfoQueryDto) {
		const range = query.daysPeriod ? new Date(Date.now() - days(query.daysPeriod)) : undefined

		const qb = this.userRepository
			.createQueryBuilder('user')
			.leftJoin(
				subQb => {
					return subQb
						.select('document.user_id', 'userId')
						.addSelect('COUNT(*)', 'docCount')
						.from(Document, 'document')
						.groupBy('document.user_id')
				},
				'doc_stats',
				'doc_stats."userId" = user.id'
			)
			.leftJoin(
				subQb => {
					return subQb
						.select('point.user_id', 'userId')
						.addSelect(`SUM(point.available) FILTER (WHERE point.type = :pointType)`, 'pointsCount')
						.addSelect(`SUM(point.available) FILTER (WHERE point.type = :revealType)`, 'revealsCount')
						.from(Point, 'point')
						.groupBy('point.user_id')
				},
				'points_data',
				'points_data."userId" = user.id'
			)
			.where('COALESCE(doc_stats."docCount", 0) BETWEEN :minCount AND :maxCount', {
				minCount: query.uploadCountMin ?? 0,
				maxCount: query.uploadCountMax ?? Number.MAX_SAFE_INTEGER
			})
			.andWhere('user.role = :role', { role: ERoleNames.USER })
			.addSelect('COALESCE(doc_stats."docCount", 0)', 'user_docCount')
			.addSelect('COALESCE(points_data."pointsCount", 0)', 'user_pointsCount')
			.addSelect('COALESCE(points_data."revealsCount", 0)', 'user_revealsCount')

		if (range) {
			qb.andWhere('user.last_activity >= :range', { range })
		}

		if (query.search) {
			qb.andWhere(
				new Brackets(qb => {
					qb.where('user.username ILIKE :search', {
						search: `%${query.search}%`
					}).orWhere('user.email ILIKE :search', {
						search: `%${query.search}%`
					})
				})
			)
		}

		const total = await this.userRepository
			.createQueryBuilder('user')
			.where('user.role = :role', { role: ERoleNames.USER })
			.getCount()

		const page = await qb
			.limit(query.limit || 10)
			.offset((query.limit || 10) * ((query.page || 1) - 1))
			.setParameters({
				pointType: EPointTypes.POINT,
				revealType: EPointTypes.REVEAL
			})
			.getRawMany()

		return plainToInstance(
			AllUsersInfoResponse,
			{ page, total },
			{
				excludeExtraneousValues: true
			}
		)
	}

	async getUserInfo(userId: number) {
		const userFromDB = await this.userRepository
			.createQueryBuilder('user')
			// Документи, які користувач завантажив
			.leftJoin('user.documents', 'document')
			.addSelect(['document.id', 'document.name', 'document.createdAt', 'document.status'])
			.loadRelationCountAndMap('document.upvotesCount', 'document.evaluations', 'evaluation', qb =>
				qb.andWhere('evaluation.type = :type', { type: EEvaluationTypes.LIKE })
			)
			.loadRelationCountAndMap('document.downvotesCount', 'document.evaluations', 'evaluation', qb =>
				qb.andWhere('evaluation.type = :type', { type: EEvaluationTypes.DISLIEKE })
			)
			// Документи, які користувач розблокував
			.leftJoin('user.unlockedDocuments', 'unlockedDoc')
			.addSelect(['unlockedDoc.id', 'unlockedDoc.createdAt'])
			.leftJoin('unlockedDoc.document', 'unlockedDocument')
			.addSelect(['unlockedDocument.id', 'unlockedDocument.name'])
			.leftJoin('unlockedDocument.user', 'author')
			.addSelect(['author.id', 'author.username'])
			.where('user.id = :userId', { userId })
			.getOne()

		if (!userFromDB) {
			throw new NotFoundException('No such user found')
		}

		return plainToInstance(GetUserInfoResponse, userFromDB, {
			excludeExtraneousValues: true
		})
	}
}
