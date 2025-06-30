import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdatePaymentMethodDto {
	@ApiProperty({
		description: 'ID details in the Stripe system',
		example: 'pm_123456789...',
		type: String
	})
	@IsString()
	paymentMethodId: string
}
