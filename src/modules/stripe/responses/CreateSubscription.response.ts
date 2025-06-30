import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class CreateSubscriptionResponse {
	@ApiProperty({
		description: 'Link to the payment page',
		example: '"https://checkout.stripe.com/c/pay/cs_test_a1CP...',
		type: String
	})
	@Expose({ name: 'url' })
	url: string
}
