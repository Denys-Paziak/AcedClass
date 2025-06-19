import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class AccountBlockingDto {
	@IsOptional()
	@IsInt({ message: 'The period of days must be an integer.' })
	@Min(1, { message: 'The value cannot be less than one.' })
	@ApiProperty({
		description: 'Період блокування акаунту в днях',
		example: 30,
		type: Number,
		required: false
	})
	daysPeriod?: number

	@IsOptional()
	@IsString()
	@IsString({ message: 'Reason must be a string.' })
	@MinLength(20, { message: 'Reason must be at least 20 characters long.' })
	@MaxLength(1000, { message: 'Reason must not exceed 1000 characters.' })
	@ApiProperty({
		description: 'Причина блокування акаунту',
		example: 'Порушення правил користування сервісом.',
		type: String,
		required: false
	})
	reason?: string
}
