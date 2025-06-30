import { Module } from '@nestjs/common'

import { PointModule } from '../point/point.module'
import { UserModule } from '../user/user.module'

import { StripeAdminController } from './controllers/stripe-admin.controller'
import { StripeController } from './controllers/stripe.controller'
import { StripeCommandService } from './services/stripe-command.service'
import { StripeQueryService } from './services/stripe-query.service'

@Module({
	imports: [UserModule, PointModule],
	controllers: [StripeController, StripeAdminController],
	providers: [StripeCommandService, StripeQueryService],
	exports: [StripeCommandService]
})
export class StripeModule {}
