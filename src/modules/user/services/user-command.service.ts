import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { days } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { addHours } from 'date-fns'
import Stripe from 'stripe'
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm'

import { EDocumentStatuses } from '../../../interfaces/EDocumentStatuses'
import { ESubscriptionStatuses } from '../../../interfaces/ESubscriptionStatuses'
import {
	BLOCKING_DURATION_FOREVER,
	BLOCKING_DURATION_HOURS_LEVEL_1,
	BLOCKING_DURATION_HOURS_LEVEL_2,
	INITIAL_STRIKE_COUNTER,
	MIN_APPROVAL_LEVEL_FOR_STRIKE_CHECK,
	MIN_DOCUMENTS_FOR_STRIKE_CHECK,
	STRIKE_LEVEL_1,
	STRIKE_LEVEL_2,
	STRIKE_LEVEL_MAX
} from '../../../magic/constants'
import { getPlusDailyUploadLimit } from '../../../magic/rules/PlusDailyLimitUpload'
import { AccountBlockingDto } from '../dtos/AccountBlocking.dto'
import { UpdateNotificationPreferencesDto } from '../dtos/UpdateNotificationPreferences.dto'
import { UpdateUserInfoDto } from '../dtos/UpdateUserInfo.dto'
import { UpdateUserInfoAndEmailDto } from '../dtos/UpdateUserInfoAndEmail.dto'
import { User } from '../entities/User.entity'

@Injectable()
export class UserCommandService {
	private stripe: Stripe

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		private readonly configService: ConfigService
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	async delete(userId: number) {
		const userFromDB = await this.userRepository.findOne({
			where: { id: userId },
			select: ['id', 'stripeCustomerId']
		})

		if (!userFromDB) {
			throw new NotFoundException('No such user found')
		}

		try {
			if (!userFromDB.stripeCustomerId) {
				throw new BadRequestException('User does not have a Stripe Customer ID')
			}

			await this.stripe.customers.del(userFromDB.stripeCustomerId)
		} catch {}
		await this.userRepository.delete({ id: userId })
	}

	async updateInfoAndCheck(userId: number, data: UpdateUserInfoDto) {
		const result = await this.userRepository.update(userId, {
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone
		})

		if (result.affected === 0) {
			throw new NotFoundException('No such user found')
		}
	}

	async updateNotificationPreferences(userId: number, data: UpdateNotificationPreferencesDto) {
		const result = await this.userRepository.update(userId, {
			emailNotifications: data.emailNotifications,
			documentApprovalAlerts: data.documentApprovalAlerts
		})

		if (result.affected === 0) {
			throw new NotFoundException('No such user found')
		}
	}

	async updateInfoAndEmailAndCheck(userId: number, data: UpdateUserInfoAndEmailDto) {
		const userFromDB = await this.userRepository.findOne({
			where: { id: userId },
			select: {
				password: true
			}
		})

		if (!userFromDB) {
			throw new NotFoundException('No such user found')
		}

		if (userFromDB.password && !(await bcrypt.compare(data.password, userFromDB.password))) {
			throw new BadRequestException('Incorrect password')
		}

		await this.userRepository.update(userId, {
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone
		})
	}

	async updatePasswordAndCheck(userId: number, password: User['password']) {
		const result = await this.userRepository.update(userId, { password })

		if (result.affected === 0) {
			throw new NotFoundException('No such user found')
		}
	}

	async recalculationApprovalLevel(userId: number, manager: EntityManager) {
		const repo = manager.getRepository(User)

		const userFromDB = await repo.findOne({ where: { id: userId }, relations: { documents: true } })

		if (userFromDB) {
			const evaluatedDocuments = userFromDB.documents.filter(
				item => item.status !== EDocumentStatuses.PENDING && item.status !== EDocumentStatuses.PROCESSING
			)
			const approvedDocuments = evaluatedDocuments.filter(item => item.status === EDocumentStatuses.APPROVED)

			const approvalLevel = evaluatedDocuments.length
				? Number(((approvedDocuments.length / evaluatedDocuments.length) * 100).toFixed(2))
				: 100

			await repo.update(userFromDB.id, { approvalLevel })

			await this.recalculationDailyLimitUploads(userId, manager)
		}
	}

	async recalculationDailyLimitUploads(userId: number, manager: EntityManager) {
		const repo = manager.getRepository(User)

		const userFromDB = await repo.findOne({ where: { id: userId }, relations: { documents: true } })

		if (userFromDB) {
			const documentCount = userFromDB.documents.length
			const approvalLevel = userFromDB.approvalLevel

			userFromDB.bonusDailyLimitUploads = getPlusDailyUploadLimit(documentCount, approvalLevel)

			if (documentCount >= MIN_DOCUMENTS_FOR_STRIKE_CHECK && approvalLevel < MIN_APPROVAL_LEVEL_FOR_STRIKE_CHECK) {
				if (userFromDB.strikeCounter === null) {
					userFromDB.strikeCounter = INITIAL_STRIKE_COUNTER
				}

				switch (userFromDB.strikeCounter) {
					case STRIKE_LEVEL_1:
						userFromDB.uploadBlocking = addHours(new Date(), BLOCKING_DURATION_HOURS_LEVEL_1)
						break
					case STRIKE_LEVEL_2:
						userFromDB.uploadBlocking = addHours(new Date(), BLOCKING_DURATION_HOURS_LEVEL_2)
						break
					case STRIKE_LEVEL_MAX:
						userFromDB.uploadBlocking = BLOCKING_DURATION_FOREVER
						break
					default:
						break
				}
			} else {
				if (userFromDB.strikeCounter !== null) {
					userFromDB.strikeCounter = null
				}
			}

			await repo.save(userFromDB)
		}
	}

	async updateDailyLimitUploadsAllUsers(newLimit: number) {
		const users = await this.userRepository.find()

		const updateValues = users.map(user => `WHEN id = ${user.id} THEN ${newLimit}`)

		const usersIds = users.map(item => item.id)

		await this.userRepository
			.createQueryBuilder()
			.update(User)
			.set({
				dailyLimitUploads: () => `CASE ${updateValues} ELSE NULL::integer END`
			})
			.where('id IN (:...usersIds)', { usersIds })
			.execute()
	}

	async updateSubscription(
		where: number | FindOptionsWhere<User>,
		data: {
			customerId?: string | null
			subscriptionId?: string | null
			subscribed?: string | null
			subscribedStatus?: ESubscriptionStatuses | null
		},
		manager?: EntityManager
	) {
		const repo = manager?.getRepository(User) || this.userRepository

		const result = await repo.update(where, {
			stripeCustomerId: data.customerId,
			stripeSubscriptionId: data.subscriptionId,
			subscription: data.subscribed,
			subscribedStatus: data.subscribedStatus
		})

		if (result.affected === 0) {
			throw new NotFoundException('No such user found')
		}
	}

	async accountBlocking(userId: number, data: AccountBlockingDto) {
		const userFromDB = await this.userRepository.findOne({
			where: { id: userId },
			select: ['id', 'stripeCustomerId']
		})

		if (!userFromDB) {
			throw new NotFoundException('No such user found')
		}

		try {
			if (!userFromDB.stripeCustomerId) {
				throw new BadRequestException('User does not have a Stripe Customer ID')
			}

			await this.stripe.customers.del(userFromDB.stripeCustomerId)
		} catch {}

		await this.userRepository.update(userId, {
			accountBlocking: data.daysPeriod ? new Date(Date.now() + days(data.daysPeriod)) : BLOCKING_DURATION_FOREVER,
			reasonBlocking: data.reason
		})
	}

	async accountUnblocking(userId: number) {
		const result = await this.userRepository.update(userId, {
			accountBlocking: null,
			reasonBlocking: null
		})

		if (result.affected === 0) {
			throw new NotFoundException('No such user found')
		}
	}
}
