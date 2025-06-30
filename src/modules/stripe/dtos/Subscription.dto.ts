import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'

export class SubscriptionDto {
	@ApiProperty({
		description: 'Subscription plan ID',
		example: 'price_1O84DsLuzkSaEhZWx...',
		type: String
	})
	@IsString()
	planId: string
}
