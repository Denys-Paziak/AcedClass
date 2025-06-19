import { Body, Controller, Get, Header, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ESubscriptionTariffs } from 'src/interfaces/ESubscriptionTariffs'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { StripeService } from './stripe.service'

@Controller('stripe')
export class StripeController {
	constructor(private readonly stripeService: StripeService) {}

	@Authorization(ERoleNames.USER)
	@Post('subscription')
	async createSubscription(@Req() request: Request, @Body() body: { plan: ESubscriptionTariffs }) {
		const userFromToken = request.user as ITokenUser

		const session = await this.stripeService.createSubscriptionSession(userFromToken.id, body.plan)

		return session
	}

	@Authorization(ERoleNames.USER)
	@Post('subscription/synchronized')
	async synchronizedSubscription(@Req() request: Request) {
		const userFromToken = request.user as ITokenUser

		await this.stripeService.synchronizedSubscription(userFromToken.id)
	}

	@Authorization(ERoleNames.USER)
	@Get('subscription/preview')
	async previewUpgradePrice(@Req() request: Request, @Body() body: { plan: ESubscriptionTariffs }) {
		const userFromToken = request.user as ITokenUser

		const session = await this.stripeService.previewUpgradePrice(userFromToken.id, body.plan)

		return session
	}

	@Authorization(ERoleNames.USER)
	@Post('subscription/update')
	async updateSubscriptionPlan(@Req() request: Request, @Body() body: { plan: ESubscriptionTariffs }) {
		const userFromToken = request.user as ITokenUser

		const session = await this.stripeService.updateSubscription(userFromToken.id, body.plan)

		return session
	}

	async getTariffs() {}

	async unsubscribe() {}

	@Header('Content-Type', 'application/json')
	@Post('webhook')
	async webhook(@Req() req: Request, @Res() res: Response) {
		try {
			await this.stripeService.webhook(req)
		} catch (err) {
			return res.status(400).send(`Webhook Error: ${err.message}`)
		}

		res.status(200).send('OK')
	}
}
