import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Brackets, Repository } from 'typeorm'

import { GetAllComplaintsQueryDto } from '../dtos/GetAllComplaintsQuery.dto'
import { Complaint } from '../entities/Complaint.entity'
import { GetAllComplaintsResponse } from '../responses/GetAllComplaints.response'

@Injectable()
export class ComplaintQueryService {
	constructor(
		@InjectRepository(Complaint)
		private readonly complaintRepository: Repository<Complaint>
	) {}

	async getAllComplaints(query: GetAllComplaintsQueryDto) {
		const qb = this.complaintRepository
			.createQueryBuilder('complaint')
			.leftJoin('complaint.author', 'author')
			.leftJoin('complaint.user', 'user')
			.leftJoin('complaint.document', 'document')
			.addSelect(['author', 'user', 'document'])

		if (query.type === 'user') {
			qb.andWhere('complaint.user IS NOT NULL')
		}
		if (query.type === 'document') {
			qb.andWhere('complaint.document IS NOT NULL')
		}

		if (query.status) {
			qb.andWhere('complaint.status = :status', { status: query.status })
		}

		if (query.startDate || query.endDate) {
			if (query.startDate && query.endDate) {
				const startDate = new Date(query.startDate)
				const endDate = new Date(query.endDate)

				qb.andWhere('document.createdAt BETWEEN :start AND :end', {
					start: new Date(startDate.setHours(0, 0, 0, 0)),
					end: new Date(endDate.setHours(23, 59, 59, 999))
				})
			} else if (query.startDate) {
				const startDate = new Date(query.startDate)

				qb.andWhere('document.createdAt >= :start', {
					start: new Date(startDate.setHours(0, 0, 0, 0))
				})
			} else if (query.endDate) {
				const endDate = new Date(query.endDate)

				qb.andWhere('document.createdAt <= :end', {
					end: new Date(endDate.setHours(23, 59, 59, 999))
				})
			}
		}

		if (query.search) {
			qb.andWhere(
				new Brackets(qb => {
					qb.where('user.username ILIKE :search', {
						search: `%${query.search}%`
					}).orWhere('document.name ILIKE :search', {
						search: `%${query.search}%`
					})
				})
			)
		}

		const total = await this.complaintRepository.createQueryBuilder('complaint').getCount()

		const page = await qb
			.take(query.limit || 10)
			.skip((query.limit || 10) * ((query.page || 1) - 1))
			.getMany()

		return plainToInstance(
			GetAllComplaintsResponse,
			{ page, total },
			{
				excludeExtraneousValues: true
			}
		)
	}
}
