import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { ESubscriptionStatuses } from 'src/interfaces/ESubscriptionStatuses'
import { ESubscriptionTariffs } from 'src/interfaces/ESubscriptionTariffs'
import Stripe from 'stripe'

import { UserCommandService } from '../user/services/user-command.service'
import { UserSystemService } from '../user/services/user-system.service'

@Injectable()
export class StripeService {
	private stripe: Stripe

	constructor(
		private readonly configService: ConfigService,
		private readonly userCommandService: UserCommandService,
		private readonly userSystemService: UserSystemService
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	async createSubscriptionSession(userId: number, plan: ESubscriptionTariffs) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		const priceId = this.configService.getOrThrow<string>(`STRIPE_PRICE_ID_${plan.toUpperCase()}`)

		let customer
		if (!userFromDB.stripeCustomerId) {
			customer = await this.stripe.customers.create({
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
					price: priceId,
					quantity: 1
				}
			],
			success_url: `https://your-site.com/success`,
			cancel_url: 'https://your-site.com/canceled',
			customer: customer.id,
			metadata: {
				userId: userFromDB.id.toString(),
				plan: plan
			},
			subscription_data: {
				metadata: {
					userId: userFromDB.id.toString(),
					plan: plan
				}
			}
		})

		return session
	}

	async updateSubscription(userId: number, plan: ESubscriptionTariffs) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (!userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID')
		}

		// Отримуємо користувача та його поточну підписку
		const subscription = await this.stripe.subscriptions.retrieve(userFromDB.stripeSubscriptionId)

		// Отримуємо ID ціни для нового плану
		const newPriceId = this.configService.getOrThrow<string>(`STRIPE_PRICE_ID_${plan.toUpperCase()}`)

		// Створюємо новий елемент підписки
		const newItem = {
			price: newPriceId,
			quantity: 1
		}

		// Оновлюємо підписку
		const updatedSubscription = await this.stripe.subscriptions.update(subscription.id, {
			items: [
				{
					id: subscription.items.data[0].id,
					deleted: true
				},
				newItem
			],
			proration_behavior: 'always_invoice', // Це забезпечує негайну проратацію
			billing_cycle_anchor: 'now', // Це починає новий білінговий цикл негайно
			metadata: {
				userId: userFromDB.id.toString(),
				plan
			}
		})

		// Оновлюємо інформацію про підписку в базі даних
		await this.userCommandService.updateSubscription(userFromDB.id, {
			subscriptionId: updatedSubscription.id,
			subscribedStatus: updatedSubscription.status as ESubscriptionStatuses,
			subscribed: plan
		})

		return updatedSubscription
	}

	async synchronizedSubscription(userId: number) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (!userFromDB.stripeCustomerId) {
			throw new BadRequestException('User does not have a Stripe Customer ID')
		}

		const subscriptions = await this.stripe.subscriptions.list({
			limit: 1,
			customer: userFromDB.stripeCustomerId
		})

		if (subscriptions.data.length === 0) {
			throw new BadRequestException('No active subscriptions found for this user')
		}

		const subscription = subscriptions.data[0]
		const priceId = subscription.items.data[0]?.price.id

		if (!priceId) {
			throw new BadRequestException('No price found for this subscription')
		}

		let subscribedName: ESubscriptionTariffs = subscriptions.data[0].metadata.plan as ESubscriptionTariffs

		await this.userCommandService.updateSubscription(userId, {
			subscriptionId: subscription.id,
			subscribedStatus: subscription.status as ESubscriptionStatuses,
			subscribed: subscribedName
		})
	}

	async previewUpgradePrice(userId: number, plan: ESubscriptionTariffs) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (!userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID')
		}

		const newPriceId = this.configService.getOrThrow<string>(`STRIPE_PRICE_ID_${plan.toUpperCase()}`)

		const subscription = await this.stripe.subscriptions.retrieve(userFromDB.stripeSubscriptionId)
		const subscriptionItemId = subscription.items.data[0].id

		const invoice = await this.stripe.invoices.createPreview({
			customer: subscription.customer as string,
			subscription: userFromDB.stripeSubscriptionId,
			subscription_details: {
				items: [
					{
						id: subscriptionItemId,
						price: newPriceId
					}
				]
			}
		})

		const amountDue = invoice.total / 100
		const currency = invoice.currency.toUpperCase()

		return {
			amountDue,
			currency
		}
	}

	async webhook(req: Request) {
		const sig = req.headers['stripe-signature']
		const secret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')

		let event: Stripe.Event

		if (sig) {
			try {
				event = this.stripe.webhooks.constructEvent((req as any).rawBody, sig, secret)
			} catch (err) {
				throw new BadRequestException(`Webhook Error: ${err.message}`)
			}

			switch (event.type) {
				case 'customer.deleted':
					const customerId = event.data.object.id

					await this.userCommandService.updateSubscription(
						{ stripeCustomerId: customerId },
						{
							customerId: null,
							subscriptionId: null,
							subscribedStatus: null,
							subscribed: null
						}
					)
					break
				case 'customer.subscription.deleted':
					const subscriptionId = event.data.object.id

					await this.userCommandService.updateSubscription(
						{ stripeSubscriptionId: subscriptionId },
						{
							subscriptionId: null,
							subscribedStatus: null,
							subscribed: null
						}
					)
					break
				case 'customer.subscription.updated':
					break
				case 'customer.subscription.created':
					break
			}
		}
	}
}
