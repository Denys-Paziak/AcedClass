import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class AddAdminCommentDto {
	@IsString()
	@MinLength(3)
	@MaxLength(1000)
	@ApiProperty({
		description: 'Administrator comment',
		example: 'This document requires additional verification.',
		minLength: 3,
		maxLength: 1000,
		type: String
	})
	adminComment: string
}
