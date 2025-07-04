import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Authorization } from '../../../decorators/auth.decorator'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ChangeActiveTariffDto } from '../dtos/ChangeActiveTariff.dto'
import { PlanIdParamDto } from '../dtos/PlanIdParam.dto'
import { GetAllTariffsResponse } from '../responses/GetAllTariffs.response'
import { StripeCommandService } from '../services/stripe-command.service'
import { StripeQueryService } from '../services/stripe-query.service'

@ApiCookieAuth()
@ApiTags('Stripe Subscription Admin')
@Controller('admin/stripe')
export class StripeAdminController {
	constructor(
		private readonly stripeQueryService: StripeQueryService,
		private readonly stripeCommandService: StripeCommandService
	) {}

	@ApiOperation({ summary: 'Get list of all subscription plans' })
	@ApiResponse({ status: 200, type: [GetAllTariffsResponse], description: 'List of subscription plans' })
	@Authorization(ERoleNames.ADMIN)
	@Get('tariffs')
	async getAllTariffs() {
		return await this.stripeQueryService.getAllTariffs()
	}

	@ApiOperation({ summary: 'Change the visibility of the tariff' })
	@ApiResponse({ status: 200, description: 'Tariff visibility successfully changed' })
	@ApiResponse({ status: 404, description: 'Subscription item not found' })
	@Authorization(ERoleNames.ADMIN)
	@Patch('tariffs/:planId/change-active')
	async changeActiveTariff(@Param() params: PlanIdParamDto, @Body() dto: ChangeActiveTariffDto) {
		await this.stripeCommandService.changeActiveTariff(params.planId, dto.status)
	}
}
