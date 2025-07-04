import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import Stripe from 'stripe'

import { UserSystemService } from '../../../modules/user/services/user-system.service'
import { GetActiveTariffsResponse } from '../responses/GetActiveTariffsResponse.response'
import { GetAllTariffsResponse } from '../responses/GetAllTariffs.response'
import { PreviewUpgradePriceResponse } from '../responses/PreviewUpgradePrice.response'

@Injectable()
export class StripeQueryService {
	private stripe: Stripe

	constructor(
		private readonly configService: ConfigService,
		private readonly userSystemService: UserSystemService
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	async getActiveTariffs() {
		const prices = (
			await this.stripe.prices.list({
				active: true,
				limit: 100,
				expand: ['data.product']
			})
		).data
			.map(item => {
				if (item.product && typeof item.product === 'object' && 'name' in item.product) {
					const { name } = item.product

					return {
						id: item.id,
						price: item.unit_amount ? item.unit_amount / 100 : 0,
						currency: item.currency,
						period: {
							interval: item.recurring?.interval,
							count: item.recurring?.interval_count
						},
						name: name
					}
				} else {
					return null
				}
			})
			.filter(item => item !== null)

		return plainToInstance(GetActiveTariffsResponse, prices, {
			excludeExtraneousValues: true
		})
	}

	async getAllTariffs() {
		const subscriptionStats = await this.userSystemService.getSubscriptionStats()

		const prices = (
			await this.stripe.prices.list({
				limit: 100,
				expand: ['data.product']
			})
		).data
			.map(item => {
				if (item.product && typeof item.product === 'object' && 'name' in item.product) {
					const { name } = item.product

					return {
						id: item.id,
						price: item.unit_amount ? item.unit_amount / 100 : 0,
						currency: item.currency,
						period: {
							interval: item.recurring?.interval,
							count: item.recurring?.interval_count
						},
						name: name,
						numberUsers: Number(subscriptionStats.find(stat => stat.subscription === item.id)?.count || '0'),
						active: item.active
					} as GetAllTariffsResponse
				} else {
					return null
				}
			})
			.filter(item => item !== null)

		return plainToInstance(GetAllTariffsResponse, prices, {
			excludeExtraneousValues: true
		})
	}

	async previewUpgradePrice(userId: number, planId: string) {
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { id: userId }
		})

		if (!userFromDB.stripeSubscriptionId) {
			throw new BadRequestException('User does not have a Stripe Subscription ID')
		}

		let subscription
		try {
			subscription = await this.stripe.subscriptions.retrieve(userFromDB.stripeSubscriptionId)
		} catch (error) {
			throw new NotFoundException('Subscription item not found')
		}
		const subscriptionItemId = subscription.items.data[0].id

		if (!subscriptionItemId) {
			throw new NotFoundException('Subscription item not found')
		}

		let invoice: Stripe.Invoice

		try {
			invoice = await this.stripe.invoices.createPreview({
				customer: subscription.customer as string,
				subscription: userFromDB.stripeSubscriptionId,
				subscription_details: {
					items: [
						{
							id: subscriptionItemId,
							price: planId
						}
					]
				}
			})
		} catch (err) {
			throw new BadRequestException('Failed to preview invoice: ' + err.message)
		}

		const amount = invoice.total / 100
		const currency = invoice.currency

		return plainToInstance(
			PreviewUpgradePriceResponse,
			{
				amount,
				currency
			},
			{
				excludeExtraneousValues: true
			}
		)
	}
}
