import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { EEvaluationDislikeTags, EEvaluationLikeTags } from 'src/interfaces/EEvaluationTags'
import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { DataSource, Repository } from 'typeorm'

import { DocumentCommandService } from '../document/services/document-command.service'
import { UnlockedDocumentService } from '../document/services/unlocked-document.service'
import { User } from '../user/entities/User.entity'

import { EvaluationDocumentDto } from './dtos/EvaluationDocument.dto'
import { Evaluation } from './entities/Evaluation.entity'
import { PointCommandService } from '../point/services/point-command.service'

@Injectable()
export class EvaluationService {
	constructor(
		@InjectRepository(Evaluation)
		private readonly evaluationRepository: Repository<Evaluation>,
		private readonly dataSource: DataSource,

		private readonly unlockedDocumentService: UnlockedDocumentService,
		private readonly documentCommandService: DocumentCommandService,
		private readonly pointCommandService: PointCommandService
	) {}

	async evaluationDocument(userId: User['id'], data: EvaluationDocumentDto) {
		const [_, unlockedCount] = await this.unlockedDocumentService.findAndCount({
			where: { document: { id: data.documentId } }
		})

		const [__, dislikeCount] = await this.evaluationRepository.findAndCount({
			where: { document: { id: data.documentId }, type: EEvaluationTypes.DISLIEKE }
		})

		const [___, userEvaluationCount] = await this.evaluationRepository.findAndCount({
			where: { user: { id: userId } }
		})

		const document = await this.unlockedDocumentService.findOneAndCheck(
			{
				where: { user: { id: userId }, document: { id: data.documentId } },
				relations: {
					document: {
						user: true
					}
				}
			},
			new BadRequestException('You cannot rate a blocked document')
		)

		if (document?.user && document.user.id === userId) {
			throw new BadRequestException('You cannot rate your document')
		}

		if (
			data.type === EEvaluationTypes.LIKE &&
			data.tags &&
			data.tags.some(value => Object.values<string>(EEvaluationDislikeTags).includes(value))
		) {
			throw new BadRequestException('Unsuitable tags')
		}

		if (
			data.type === EEvaluationTypes.DISLIEKE &&
			data.tags &&
			data.tags.some(value => Object.values<string>(EEvaluationLikeTags).includes(value))
		) {
			throw new BadRequestException('Unsuitable tags')
		}

		const existingEvaluation = await this.evaluationRepository.findOne({
			where: { user: { id: userId }, document: { id: data.documentId } }
		})

		await this.dataSource.transaction(async manager => {
			await manager.getRepository(Evaluation).save({
				id: existingEvaluation?.id,
				tags: data.tags?.join(',') || '',
				type: data.type,
				document: { id: data.documentId },
				user: { id: userId }
			})

			if ((userEvaluationCount + 1) % 4 === 0) {
				await this.pointCommandService.addPoints(userId, 4, { type: 'evaluation' }, manager)
			}

			if (
				(unlockedCount === 4 || unlockedCount === 5) &&
				dislikeCount + (data.type === EEvaluationTypes.DISLIEKE ? 1 : 0) === 3
			) {
				await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.REJECTED)
			}
		})
	}
}
