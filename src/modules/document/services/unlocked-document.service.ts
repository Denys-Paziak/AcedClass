import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { PointCommandService } from 'src/modules/point/services/point-command.service'
import { Brackets, DataSource, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

import { User } from '../../user/entities/User.entity'
import { GetAllUnlocksQueryDto } from '../dtos/GetAllUnlocksQuery.dto'
import { Document } from '../entities/Document.entity'
import { UnlockedDocument } from '../entities/Unlocked-document.entity'
import { GetAllUnlocksResponse } from '../responses/GetAllUnlocks.response'
import { GetMyUnlockedDocumentsResponse } from '../responses/GetMyUnlockedDocuments.response'

@Injectable()
export class UnlockedDocumentService {
	constructor(
		@InjectRepository(UnlockedDocument)
		private readonly unlockedDocumentRepository: Repository<UnlockedDocument>,
		@InjectRepository(Document)
		private readonly documentRepository: Repository<Document>,
		private readonly dataSource: DataSource,

		private readonly pointCommandService: PointCommandService
	) {}

	async count(options?: FindManyOptions<UnlockedDocument> | undefined) {
		return await this.unlockedDocumentRepository.count(options)
	}

	async unlockDocument(data: {
		pointType: EPointTypes
		quantityPoint: number
		userId: User['id']
		documentId: Document['id']
	}) {
		const { documentId, userId, pointType, quantityPoint } = data

		if (
			!await this.documentRepository.findOne({ where: { id: documentId, user: { id: userId } }, relations: { user: true } })
		) {
			await this.dataSource.transaction(async manager => {
				await this.pointCommandService.writeOffPoints({ userId, pointType, quantityPoint }, manager)
	
				await manager?.getRepository(UnlockedDocument).save({
					pointType: pointType,
					document: { id: documentId },
					user: { id: userId }
				})
			})
		} else {
			throw new BadRequestException('You cannot unlock your own document.')
		}
	}

	async findOneAndCheck(options: FindOneOptions<UnlockedDocument>, error?: HttpException) {
		const record = await this.unlockedDocumentRepository.findOne({
			...options,
			relations: { document: true, ...options.relations }
		})
		if (!record) throw error || new NotFoundException('Unlocked document not found')

		return record.document
	}

	async findAndCount(options?: FindManyOptions<UnlockedDocument> | undefined) {
		return await this.unlockedDocumentRepository.findAndCount(options)
	}

	async find(options?: FindManyOptions<UnlockedDocument> | undefined) {
		return await this.unlockedDocumentRepository.find(options)
	}

	async findOne(options: FindManyOptions<UnlockedDocument>) {
		return await this.unlockedDocumentRepository.findOne(options)
	}

	async getMyUnlockedDocuments(userId: number) {
		const result = await this.unlockedDocumentRepository.find({
			where: { user: { id: userId } },
			relations: { document: { university: true } }
		})

		return plainToInstance(GetMyUnlockedDocumentsResponse, result, {
			excludeExtraneousValues: true
		})
	}

	async getAllUnlocks(query: GetAllUnlocksQueryDto) {
		const qb = this.unlockedDocumentRepository
			.createQueryBuilder('unlockedDocument')
			.leftJoin('unlockedDocument.document', 'document')
			.addSelect(['document.id', 'document.name'])
			.leftJoin('document.user', 'author')
			.addSelect(['author.id', 'author.username'])
			.leftJoin('unlockedDocument.user', 'user')
			.addSelect(['user.id', 'user.username', 'user.email'])

		if (query.createdAt) {
			const date = new Date(query.createdAt)
			const start = new Date(date.setHours(0, 0, 0, 0))
			const end = new Date(date.setHours(23, 59, 59, 999))
			qb.andWhere('unlockedDocument.createdAt BETWEEN :start AND :end', { start, end })
		}

		if (query.search) {
			qb.andWhere(
				new Brackets(qb => {
					qb.where('user.username ILIKE :search', {
						search: `%${query.search}%`
					})
						.orWhere('user.email ILIKE :search', {
							search: `%${query.search}%`
						})
						.orWhere('document.name ILIKE :search', {
							search: `%${query.search}%`
						})
				})
			)
		}

		const total = await this.unlockedDocumentRepository.createQueryBuilder('unlockedDocument').getCount()

		const page = await qb
			.take(query.limit || 10)
			.skip((query.limit || 10) * ((query.page || 1) - 1))
			.getMany()

		return plainToInstance(
			GetAllUnlocksResponse,
			{ page, total },
			{
				excludeExtraneousValues: true
			}
		)
	}
}
