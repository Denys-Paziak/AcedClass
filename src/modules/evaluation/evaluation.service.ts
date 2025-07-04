import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { EDocumentStatuses } from '../../interfaces/EDocumentStatuses'
import { EEvaluationDislikeTags, EEvaluationLikeTags } from '../../interfaces/EEvaluationTags'
import { EEvaluationTypes } from '../../interfaces/EEvaluationTypes'
import {
	AUTO_REJECT_DISLIKE_THRESHOLD,
	MAX_UNLOCKS_FOR_DISLIKE_CHECK,
	MIN_UNLOCKS_FOR_DISLIKE_CHECK,
	POINT_REWARD_EVALUATION_INTERVAL,
	POINTS_PER_EVALUATION_REWARD
} from '../../magic/constants'
import { DocumentCommandService } from '../document/services/document-command.service'
import { UnlockedDocumentService } from '../document/services/unlocked-document.service'
import { PointCommandService } from '../point/services/point-command.service'
import { SystemSettingQueryService } from '../system-setting/services/system-setting-query.service'

import { EvaluationDocumentDto } from './dtos/EvaluationDocument.dto'
import { Evaluation } from './entities/Evaluation.entity'

@Injectable()
export class EvaluationService {
	constructor(
		@InjectRepository(Evaluation)
		private readonly evaluationRepository: Repository<Evaluation>,
		private readonly dataSource: DataSource,

		private readonly unlockedDocumentService: UnlockedDocumentService,
		private readonly documentCommandService: DocumentCommandService,
		private readonly pointCommandService: PointCommandService,
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	async evaluationDocument(userId: number, data: EvaluationDocumentDto) {
		const settings = await this.systemSettingQueryService.getSettings(['feature toggles'])

		if (!settings('feature toggles').votingSystem) {
			throw new ServiceUnavailableException('Document evaluation is currently disabled by the system.')
		}

		const [_, unlockedCount] = await this.unlockedDocumentService.findAndCount({
			where: { document: { id: data.documentId } }
		})

		const [__, dislikeCount] = await this.evaluationRepository.findAndCount({
			where: { document: { id: data.documentId }, type: EEvaluationTypes.DISLIEKE }
		})

		const [___, userEvaluationCount] = await this.evaluationRepository.findAndCount({
			where: { user: { id: userId } }
		})

		const documentFromDB = await this.unlockedDocumentService.findOneAndCheck(
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

		if (documentFromDB?.user && documentFromDB.user.id === userId) {
			throw new BadRequestException('You cannot rate your document')
		}

		if (documentFromDB?.status === EDocumentStatuses.REJECTED || documentFromDB?.status === EDocumentStatuses.PROCESSING) {
			throw new BadRequestException('You cannot rate a hidden document.')
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

			if ((userEvaluationCount + 1) % POINT_REWARD_EVALUATION_INTERVAL === 0) {
				await this.pointCommandService.addPoints(userId, POINTS_PER_EVALUATION_REWARD, { type: 'evaluation' }, manager)
			}

			if (
				(unlockedCount === MIN_UNLOCKS_FOR_DISLIKE_CHECK || unlockedCount === MAX_UNLOCKS_FOR_DISLIKE_CHECK) &&
				dislikeCount + (data.type === EEvaluationTypes.DISLIEKE ? 1 : 0) === AUTO_REJECT_DISLIKE_THRESHOLD
			) {
				await this.documentCommandService.changeStatus(data.documentId, EDocumentStatuses.REJECTED, manager)
			}
		})
	}
}
