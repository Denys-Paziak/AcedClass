import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class AccountBlockingDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@ApiProperty({
		description: 'Account blocking period in days',
		example: 30,
		type: Number,
		required: false
	})
	daysPeriod?: number

	@IsOptional()
	@IsString()
	@MinLength(20)
	@MaxLength(1000)
	@ApiProperty({
		description: 'Reason for account blocking',
		example: 'Violation of service usage rules.',
		type: String,
		required: false
	})
	reason?: string
}
