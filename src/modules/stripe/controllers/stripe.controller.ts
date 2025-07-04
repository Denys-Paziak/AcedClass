import { BadRequestException, Body, Controller, Delete, Get, Header, Param, Post, Put, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import Stripe from 'stripe'

import { Authorization } from '../../../decorators/auth.decorator'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'
import { StripeQueryService } from '../services/stripe-query.service'
import { WinstonLogger } from '../../logger/winston.logger'
import { PlanIdParamDto } from '../dtos/PlanIdParam.dto'
import { SubscriptionDto } from '../dtos/Subscription.dto'
import { UpdatePaymentMethodDto } from '../dtos/UpdatePaymentMethod.dto'
import { CreateSubscriptionResponse } from '../responses/CreateSubscription.response'
import { GetActiveTariffsResponse } from '../responses/GetActiveTariffsResponse.response'
import { PreviewUpgradePriceResponse } from '../responses/PreviewUpgradePrice.response'
import { StripeCommandService } from '../services/stripe-command.service'

@ApiTags('Stripe Subscription')
@Controller('stripe')
export class StripeController {
	private stripe: Stripe

	constructor(
		private readonly stripeCommandService: StripeCommandService,
		private readonly stripeQueryService: StripeQueryService,
		private readonly configService: ConfigService,
		private readonly logger: WinstonLogger
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'))
	}

	@ApiOperation({ summary: 'Create subscription and get Stripe Checkout session' })
	@ApiResponse({ status: 201, type: CreateSubscriptionResponse, description: 'Subscription created successfully' })
	@ApiResponse({ status: 409, description: 'User already has an active subscription' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Post('subscription')
	async createSubscription(@Req() request: Request, @Body() dto: SubscriptionDto): Promise<CreateSubscriptionResponse> {
		const userFromToken = request.user as ITokenUser
		return await this.stripeCommandService.createSubscriptionSession(userFromToken.id, dto.planId)
	}

	@ApiOperation({ summary: 'Synchronize user subscription with Stripe' })
	@ApiResponse({ status: 200, description: 'Subscription synchronized successfully' })
	@ApiResponse({ status: 400, description: 'Failed to synchronize subscription' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Put('subscription/synchronized')
	async synchronizedSubscription(@Req() request: Request) {
		const userFromToken = request.user as ITokenUser
		await this.stripeCommandService.synchronizedSubscription(userFromToken.id)
	}

	@ApiOperation({ summary: 'Preview upgrade price for subscription plan' })
	@ApiResponse({ status: 200, type: PreviewUpgradePriceResponse, description: 'Preview of upgrade price' })
	@ApiResponse({ status: 400, description: 'Failed to preview invoice' })
	@ApiResponse({ status: 404, description: 'Subscription item not found' })
	@ApiResponse({ status: 400, description: 'User does not have a Stripe Subscription ID' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Get('subscription/update-preview/:planId')
	async previewUpgradePrice(@Req() request: Request, @Param() params: PlanIdParamDto): Promise<PreviewUpgradePriceResponse> {
		const userFromToken = request.user as ITokenUser
		return await this.stripeQueryService.previewUpgradePrice(userFromToken.id, params.planId)
	}

	@ApiOperation({ summary: 'Update user subscription plan' })
	@ApiResponse({ status: 200, description: 'Subscription updated successfully' })
	@ApiResponse({ status: 400, description: 'Plan not found or unavailable' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Put('subscription/update')
	async updateSubscription(@Req() request: Request, @Body() dto: SubscriptionDto) {
		const userFromToken = request.user as ITokenUser
		await this.stripeCommandService.updateSubscription(userFromToken.id, dto.planId)
	}

	@ApiOperation({ summary: 'Update payment method for subscription' })
	@ApiResponse({ status: 200, description: 'Payment method updated successfully' })
	@ApiResponse({ status: 400, description: 'User does not have an active subscription' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Put('subscription/update-payment-method')
	async updatePaymentMethod(@Req() request: Request, @Body() dto: UpdatePaymentMethodDto) {
		const userFromToken = request.user as ITokenUser
		await this.stripeCommandService.updatePaymentMethod(userFromToken.id, dto.paymentMethodId)
	}

	@ApiOperation({ summary: 'Get list of available subscription plans' })
	@ApiResponse({ status: 200, type: [GetActiveTariffsResponse], description: 'List of subscription plans' })
	@Get('tariffs')
	async getActiveTariffs(): Promise<GetActiveTariffsResponse[]> {
		return await this.stripeQueryService.getActiveTariffs()
	}

	@ApiOperation({ summary: 'Cancel user subscription' })
	@ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
	@ApiResponse({ status: 400, description: 'Failed to cancel subscription' })
	@ApiCookieAuth()
	@Authorization(ERoleNames.USER)
	@Delete('subscription/unsubscribe')
	async unsubscribe(@Req() request: Request) {
		const userFromToken = request.user as ITokenUser
		await this.stripeCommandService.unsubscribe(userFromToken.id)
	}

	@ApiOperation({ summary: 'Stripe webhook handler (called by Stripe server)' })
	@Header('Content-Type', 'application/json')
	@Post('webhook')
	async webhook(@Req() req: Request, @Res() res: Response) {
		const sig = req.headers['stripe-signature']
		const secret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')

		let event: Stripe.Event

		if (!sig) {
			this.logger.warn('🪝 Missing Stripe signature header')
			throw new BadRequestException('Missing Stripe signature')
		}

		try {
			event = this.stripe.webhooks.constructEvent((req as any).rawBody, sig, secret)
			this.logger.log(`🪝 Received webhook: ${event.type}`)
		} catch (err) {
			this.logger.error(
				'🪝 Webhook signature verification failed',
				err.stack,
				`Error: ${JSON.stringify(err.message || err)}`
			)
			throw new BadRequestException(`Webhook Error: ${err.message}`)
		}

		await this.stripeCommandService.webhook(event)

		res.status(200).send('OK')
	}
}
