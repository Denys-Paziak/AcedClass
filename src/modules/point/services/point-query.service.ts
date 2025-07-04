import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'

import { Point } from '../entities/Point.entity'
import { GetMyPointsResponse } from '../responses/GetMyPoints.response'

@Injectable()
export class PointQueryService {
	constructor(
		@InjectRepository(Point)
		private readonly pointRepository: Repository<Point>
	) {}

	async getPointsAndReveals(userId: number) {
		const result = await this.pointRepository
			.createQueryBuilder('point')
			.select('point.type', 'type')
			.addSelect('SUM(point.available)', 'totalavailable')
			.where('point.user_id = :userId', { userId })
			.andWhere('point.frozen = :frozen', { frozen: false })
			.groupBy('point.type')
			.getRawMany()

		return plainToInstance(
			GetMyPointsResponse,
			result.reduce<Record<string, number>>(
				(acc, value) => {
					return { ...acc, [value.type]: Number(value.totalavailable) }
				},
				{ reveals: 0, points: 0 }
			),
			{
				excludeExtraneousValues: true
			}
		)
	}
}
