import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'

import { SearchUniversitiesQueryDto } from './dtos/SearchUniversitiesQuery.dto'
import { TopUniversitiesQueryDto } from './dtos/TopUniversitiesQuery.dto'
import { University } from './entities/University.entity'
import { SearchUniversitiesResponse } from './responses/SearchUniversities.response'
import { TopUniversitiesResponse } from './responses/TopUniversities.response'

@Injectable()
export class UniversityService {
	constructor(
		@InjectRepository(University)
		private readonly universityRepository: Repository<University>
	) {}

	async searchUniversities(query: SearchUniversitiesQueryDto) {
		const result = await this.universityRepository
			.createQueryBuilder('university')
			.andWhere('university.name ILIKE :search', { search: `%${query.search}%` })
			.take(query.limit || 20)
			.getMany()

		return plainToInstance(SearchUniversitiesResponse, result, {
			excludeExtraneousValues: true
		})
	}

	async topUniversities(query: TopUniversitiesQueryDto) {
		const result = await this.universityRepository
			.createQueryBuilder('university')
			.leftJoin('university.documents', 'document')
			.orderBy('COUNT(document.id)', 'DESC')
			.groupBy('university.id')
			.limit(query.limit || 5)
			.select(['university.id', 'university.name', 'COUNT(document.id) AS documentCount'])
			.getRawMany()

		return plainToInstance(TopUniversitiesResponse, result, {
			excludeExtraneousValues: true
		})
	}
}
