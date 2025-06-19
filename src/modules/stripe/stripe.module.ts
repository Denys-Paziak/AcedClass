import { forwardRef, Module } from '@nestjs/common'

import { UserModule } from '../user/user.module'

import { StripeController } from './stripe.controller'
import { StripeService } from './stripe.service'

@Module({
	imports: [forwardRef(() => UserModule)],
	controllers: [StripeController],
	providers: [StripeService],
	exports: [StripeService]
})
export class StripeModule {}
