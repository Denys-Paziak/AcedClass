import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { MAX_RECOMMENDATION_ITEMS } from 'src/magic/constants'
import { Evaluation } from 'src/modules/evaluation/entities/Evaluation.entity'
import { DataSource, Not, Repository } from 'typeorm'

import { GetAllDocumentsQueryDto } from '../dtos/GetAllDocumentsQuery.dto'
import { SearchDocumentsDto } from '../dtos/SearchDocuments.dto'
import { Document } from '../entities/Document.entity'
import { GetAllDocumentsResponse } from '../responses/GetAllDocuments.response'
import { GetMyDocumentsResponse } from '../responses/GetMyDocuments.response'
import { GetOneDocumentReponse } from '../responses/GetOneDocument.response'
import { GetOneDocumentAndRecomendationResponse } from '../responses/GetOneDocumentAndRecomendation.response'

import { DocumentSystemService } from './document-system.service'
import { UnlockedDocumentService } from './unlocked-document.service'

@Injectable()
export class DocumentQueryService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepository: Repository<Document>,
		private readonly dataSource: DataSource,

		private readonly unlockedDocumentService: UnlockedDocumentService,
		private readonly documentSystemService: DocumentSystemService
	) {}

	async getOneDocumentAndRecomendation(userId: number | undefined, documentSystemName: string) {
		const isUnlocked = userId
			? !!(await this.unlockedDocumentService.findOne({
					where: { document: { systemName: documentSystemName }, user: { id: userId } },
					relations: {
						user: true,
						document: true
					}
				}))
			: false

		const document = await this.documentRepository.findOne({
			where: { systemName: documentSystemName },
			select: {
				id: true,
				linkFile: true,
				name: true,
				complaints: true,
				courseName: true,
				createdAt: true,
				linksBlurFile: true,
				numberViews: true,
				pageCount: true,
				semester: true,
				systemName: true
			},
			relations: {
				evaluations: true,
				unlockedDocuments: true,
				user: true,
				university: true
			}
		})

		if (!document) throw new NotFoundException('No such document found.')

		const numberEvaluations = document.evaluations.length
		const numberLikes = document.evaluations.filter(item => item.type === EEvaluationTypes.LIKE).length

		const topUniversityAndCourseName = await this.documentRepository.find({
			where: {
				id: Not(document.id),
				university: { id: document.university?.id },
				courseName: document.courseName || undefined
			},
			order: { numberViews: 'DESC' },
			select: {
				id: true,
				linkPreview: true,
				name: true,
				courseName: true,
				numberViews: true
			},
			relations: {
				university: true
			}
		})

		const topUniversity = await this.documentRepository.find({
			where: { id: Not(document.id), university: { id: document.university?.id } },
			order: { numberViews: 'DESC' },
			select: {
				id: true,
				linkPreview: true,
				name: true,
				courseName: true,
				numberViews: true
			},
			relations: {
				university: true
			}
		})

		const revealChain =
			topUniversityAndCourseName.length <= MAX_RECOMMENDATION_ITEMS
				? topUniversityAndCourseName
				: [...topUniversityAndCourseName, ...topUniversity].slice(0, MAX_RECOMMENDATION_ITEMS)

		const recommendations =
			topUniversityAndCourseName.length <= MAX_RECOMMENDATION_ITEMS
				? topUniversityAndCourseName.slice(-MAX_RECOMMENDATION_ITEMS)
				: [...topUniversity, ...topUniversityAndCourseName].slice(-MAX_RECOMMENDATION_ITEMS)

		return plainToInstance(
			GetOneDocumentAndRecomendationResponse,
			{
				id: document.id,
				name: document.name,
				university: document.university,
				courseName: document.courseName,
				semester: document.semester,
				linkFile: isUnlocked || (userId && document.user?.id === userId) ? document.linkFile : document.linksBlurFile,
				createdAt: document.createdAt,
				pageCount: document.pageCount,
				numberViews: document.numberViews,
				numberRevealed: document.unlockedDocuments.length,
				rating: numberEvaluations ? Number(((numberLikes / numberEvaluations) * 100).toFixed(2)) : 100,
				revealChain,
				recommendations,
				isUnlocked: isUnlocked || !!(userId && document.user?.id === userId)
			},
			{
				excludeExtraneousValues: true
			}
		)
	}

	async getMyDocuments(userId: number) {
		const result = await this.documentRepository.find({
			where: { user: { id: userId } },
			select: {
				id: true,
				name: true,
				status: true,
				linkFile: true,
				linkPreview: true,
				semester: true,
				courseName: true,
				createdAt: true
			},
			relations: {
				university: true
			}
		})

		return plainToInstance(GetMyDocumentsResponse, result, {
			excludeExtraneousValues: true
		})
	}

	async getAllDocuments(query: GetAllDocumentsQueryDto) {
		const qb = this.documentRepository
			.createQueryBuilder('document')
			.addSelect(['document.linkFile'])
			.leftJoin('document.university', 'university')
			.addSelect(['university.id', 'university.name'])

		if (query.university) {
			qb.andWhere('university.name = :university', { university: query.university })
		}

		if (query.courseName) {
			qb.andWhere('document.courseName = :courseName', { courseName: query.courseName })
		}

		if (query.createdAt) {
			const date = new Date(query.createdAt)
			const start = new Date(date.setHours(0, 0, 0, 0))
			const end = new Date(date.setHours(23, 59, 59, 999))
			qb.andWhere('document.createdAt BETWEEN :start AND :end', { start, end })
		}

		if (query.status) {
			qb.andWhere('document.status = :status', { status: query.status })
		}

		if (query.search) {
			qb.andWhere('document.name ILIKE :search', { search: `%${query.search}%` })
		}

		const total = await this.documentRepository.createQueryBuilder('document').getCount()

		const page = await qb
			.take(query.limit || 10)
			.skip((query.limit || 10) * ((query.page || 1) - 1))
			.getMany()

		return plainToInstance(
			GetAllDocumentsResponse,
			{ page, total },
			{
				excludeExtraneousValues: true
			}
		)
	}

	async getOneDocument(documentId: number) {
		const result = await this.documentSystemService.findOneAndCheck({
			where: { id: documentId },
			relations: { user: true, university: true }
		})

		return plainToInstance(GetOneDocumentReponse, result, {
			excludeExtraneousValues: true
		})
	}

	async searchDocuments(options: SearchDocumentsDto) {
		const qb = this.dataSource
			.getRepository(Document)
			.createQueryBuilder('document')
			.leftJoinAndSelect('document.university', 'university')
			.leftJoin(
				subQb => {
					return subQb
						.select('evaluation.document_id', 'documentId')
						.addSelect('COUNT(*)', 'likesCount')
						.from(Evaluation, 'evaluation')
						.where('evaluation.type = :likeType', { likeType: EEvaluationTypes.LIKE })
						.groupBy('evaluation.document_id')
				},
				'likes_count',
				'likes_count."documentId" = document.id'
			)
			.addSelect('COALESCE(likes_count."likesCount", 0)', 'likesCount')

		if (options.ids) {
			qb.andWhere('document.id IN (:...ids)', { ids: options.ids })
		}

		if (options.university) {
			qb.andWhere('university.name ILIKE :universityName', {
				universityName: `%${options.university}%`
			})
		}

		if (options.courseName) {
			qb.andWhere('document.courseName ILIKE :courseName', {
				courseName: `%${options.courseName}%`
			})
		}

		if (options.sortByLikesCount) {
			qb.addOrderBy('"likesCount"', options.sortByLikesCount)
		}

		if (options.sortByCreatedAt) {
			qb.addOrderBy('document.createdAt', options.sortByCreatedAt)
		}

		if (!options.sortByLikesCount && !options.sortByCreatedAt && options.ids?.length) {
			const orderedIds = options.ids.join(', ')

			qb.addSelect(`ARRAY_POSITION(ARRAY[${orderedIds}], document.id)`, 'custom_order')

			qb.orderBy('custom_order', 'ASC')
		}

		const total = await this.documentRepository.createQueryBuilder('document').getCount()

		const page = options.ids && options.ids.length === 0 ? [] : await qb
			.take(options.limit || 10)
			.skip((options.limit || 10) * ((options.page || 1) - 1))
			.getRawMany()

		return { page, total }
	}
}
