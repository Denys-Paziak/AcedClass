import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import Stripe from 'stripe'
import { DataSource } from 'typeorm'

import { ESubscriptionStatuses } from '../../../interfaces/ESubscriptionStatuses'
import { SUBSCRIPTION_REVEALS_AMOUNT } from '../../../magic/constants'
import { WinstonLogger } from '../../logger/winston.logger'
import { PointCommandService } from '../../point/services/point-command.service'
import { UserCommandService } from '../../user/services/user-command.service'
import { UserSystemService } from '../../user/services/user-system.service'
import { CreateSubscriptionResponse } from '../responses/CreateSubscription.response'

@Injectable()
export class StripeCommandService {
	private stripe: Stripe
	private readonly CANCEL_STATUSES = [ESubscriptionStatuses.CANCELED, ESubscriptionStatuses.UNPAID]
	private readonly ACTIVE_STATUSES = [ESubscriptionStatuses.ACTIVE, ESubscriptionStatuses.PAST_DUE]

	constructor(
		private readonly dataSource: DataSource,

		private readonly configService: ConfigService,
		private readonly userCommandService: UserCommandService,
		private readonly userSystemService: UserSystemService,
		private readonly pointCommandService: PointCommandService,
		private readonly logger: WinstonLogger
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	async createSubscriptionSession(userId: number, planId: string) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (userFromDB.subscribedStatus && this.ACTIVE_STATUSES.includes(userFromDB.subscribedStatus)) {
			throw new ConflictException('The user already has a subscription')
		}

		let customer
		if (!userFromDB.stripeCustomerId) {
			customer = await this.stripe.customers.create({
				name: userFromDB.username,
				email: userFromDB.email,
				phone: userFromDB.phone || undefined,
				metadata: { userId: userFromDB.id.toString() }
			})
		} else {
			customer = { id: userFromDB.stripeCustomerId }
		}

		await this.userCommandService.updateSubscription(userFromDB.id, {
			customerId: customer.id
		})

		const session = await this.stripe.checkout.sessions.create({
			mode: 'subscription',
			line_items: [
				{
					price: planId,
					quantity: 1
				}
			],
			success_url: this.configService.getOrThrow<string>('STRIPE_SUCCESS_URL'),
			cancel_url: this.configService.getOrThrow<string>('STRIPE_CANCEL_URL'),
			customer: customer.id,
			metadata: {
				userId: userFromDB.id.toString()
			},
			subscription_data: {
				metadata: {
					userId: userFromDB.id.toString()
				}
			}
		})

		return plainToInstance(CreateSubscriptionResponse, session, {
			excludeExtraneousValues: true
		})
	}

	async updateSubscription(userId: number, planId: string) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (!userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID')
		}

		const subscription = await this.stripe.subscriptions.retrieve(userFromDB.stripeSubscriptionId)

		const newItem = {
			price: planId,
			quantity: 1
		}

		await this.stripe.subscriptions.update(subscription.id, {
			items: [
				{
					id: subscription.items.data[0].id,
					deleted: true
				},
				newItem
			],
			proration_behavior: 'always_invoice',
			metadata: {
				userId: userFromDB.id.toString()
			}
		})
	}

	async updatePaymentMethod(userId: number, paymentMethodId: string) {
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: userId } })

		if (!userFromDB.stripeCustomerId || !userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID or Stripe Customer ID')
		}

		await this.stripe.paymentMethods.attach(paymentMethodId, { customer: userFromDB.stripeCustomerId })
		await this.stripe.customers.update(userFromDB.stripeCustomerId, {
			invoice_settings: { default_payment_method: paymentMethodId }
		})
	}

	async synchronizedSubscription(userId: number) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId },
			select: ['id', 'stripeCustomerId', 'subscribedStatus']
		})

		if (!userFromDB.stripeCustomerId) return

		let subscriptions: Stripe.Response<Stripe.ApiList<Stripe.Subscription>>

		try {
			subscriptions = await this.stripe.subscriptions.list({
				customer: userFromDB.stripeCustomerId,
				limit: 1
			})
		} catch (error) {
			if (error.message.includes('No such customer:')) {
				await this.userCommandService.updateSubscription(userId, {
					customerId: null,
					subscriptionId: null,
					subscribedStatus: null,
					subscribed: null
				})
			}
			throw new InternalServerErrorException('Incomplete subscription data')
		}

		if (subscriptions.data.length === 0) {
			await this.userCommandService.updateSubscription(userFromDB.id, {
				subscriptionId: null,
				subscribedStatus: null,
				subscribed: null
			})
			return
		}

		const subscription = subscriptions.data[0]
		const subscriptionStatus = subscription.status as ESubscriptionStatuses
		const priceId = subscription.items.data[0].price.id

		if (!subscription.id || !subscriptionStatus) {
			throw new InternalServerErrorException('Incomplete subscription data')
		}

		await this.dataSource.transaction(async manager => {
			if (userFromDB.subscribedStatus === null && subscriptionStatus === ESubscriptionStatuses.ACTIVE) {
				await this.pointCommandService.addReveals(
					{ id: userFromDB.id },
					SUBSCRIPTION_REVEALS_AMOUNT,
					{ type: 'subscription' },
					manager
				)
			}

			if (
				userFromDB.subscribedStatus !== null &&
				!this.CANCEL_STATUSES.includes(userFromDB.subscribedStatus) &&
				this.CANCEL_STATUSES.includes(subscriptionStatus)
			) {
				await this.pointCommandService.burningAllUserReveals({ id: userFromDB.id }, manager)
			}

			await this.userCommandService.updateSubscription(
				userId,
				{
					subscriptionId: subscription.id,
					subscribedStatus: subscriptionStatus,
					subscribed: priceId
				},
				manager
			)
		})
	}

	async unsubscribe(userId: number) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId },
			select: ['id', 'stripeSubscriptionId']
		})

		if (!userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID')
		}

		await this.stripe.subscriptions.update(userFromDB.stripeSubscriptionId, {
			cancel_at_period_end: true
		})
	}

	async changeActiveTariff(planId: string, status: boolean) {
		try {
			await this.stripe.prices.update(planId, {
				active: status
			})
		} catch (error) {
			throw new NotFoundException('Subscription item not found')
		}
	}

	async webhook(event: Stripe.Event) {
		try {
			switch (event.type) {
				case 'customer.deleted':
					await this.handleCustomerDeleted(event.data.object.id)
					break
				case 'customer.subscription.deleted':
					await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
					break
				case 'customer.subscription.created':
					await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
					break
				case 'customer.subscription.updated':
					await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
					break
			}
		} catch (err) {
			this.logger.error(
				`🪝 Error processing event: ${event.type}`,
				err.stack,
				`Error: ${JSON.stringify(err.message || err)}`
			)
			throw err
		}
	}

	private async handleCustomerDeleted(customerId: string) {
		await this.dataSource.transaction(async manager => {
			await this.pointCommandService.burningAllUserReveals({ stripeCustomerId: customerId }, manager)

			await this.userCommandService.updateSubscription(
				{ stripeCustomerId: customerId },
				{
					customerId: null,
					subscriptionId: null,
					subscribedStatus: null,
					subscribed: null
				}
			)
		})

		this.logger.log(
			`🪝 Customer deleted`,
			JSON.stringify({
				customerId
			})
		)
	}

	private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
		const subscriptionId = subscription.id
		const customerId = subscription.customer as string

		await this.dataSource.transaction(async manager => {
			await this.pointCommandService.burningAllUserReveals({ stripeCustomerId: customerId }, manager)

			await this.userCommandService.updateSubscription(
				{ stripeSubscriptionId: subscriptionId },
				{
					subscriptionId: null,
					subscribedStatus: null,
					subscribed: null
				},
				manager
			)
		})

		this.logger.log(
			`🪝 Subscription deleted`,
			JSON.stringify({
				subscriptionId,
				customerId
			})
		)
	}

	private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
		const subscriptionId = subscription.id
		const subscriptionStatus = subscription.status as ESubscriptionStatuses
		const customerId = subscription.customer as string
		const priceId = subscription.items.data[0].price.id

		if (!subscriptionId || !subscriptionStatus || !customerId) {
			throw new InternalServerErrorException('Incomplete subscription data')
		}

		await this.dataSource.transaction(async manager => {
			await this.userCommandService.updateSubscription(
				{ stripeCustomerId: customerId },
				{
					subscriptionId: subscriptionId,
					subscribedStatus: subscriptionStatus,
					subscribed: priceId
				},
				manager
			)
			await this.pointCommandService.addReveals(
				{ stripeCustomerId: customerId },
				SUBSCRIPTION_REVEALS_AMOUNT,
				{ type: 'subscription' },
				manager
			)
		})

		this.logger.log(
			`🪝 Subscription created`,
			JSON.stringify({
				subscriptionId,
				subscriptionStatus,
				customerId,
				subscribedName: priceId
			})
		)
	}

	private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
		const subscriptionId = subscription.id
		const subscriptionStatus = subscription.status as ESubscriptionStatuses
		const customerId = subscription.customer as string
		const priceId = subscription.items.data[0].price.id

		if (!subscriptionId || !subscriptionStatus || !customerId) {
			throw new InternalServerErrorException('Incomplete subscription data')
		}

		await this.dataSource.transaction(async manager => {
			if (this.CANCEL_STATUSES.includes(subscriptionStatus)) {
				await this.pointCommandService.burningAllUserReveals({ stripeCustomerId: customerId }, manager)
			}

			await this.userCommandService.updateSubscription(
				{ stripeCustomerId: customerId },
				{
					subscriptionId: subscriptionId,
					subscribedStatus: subscriptionStatus,
					subscribed: priceId
				},
				manager
			)
		})

		this.logger.log(
			`🪝 Subscription updated`,
			JSON.stringify({
				subscriptionId,
				subscriptionStatus,
				customerId,
				subscribedName: priceId
			})
		)
	}
}
