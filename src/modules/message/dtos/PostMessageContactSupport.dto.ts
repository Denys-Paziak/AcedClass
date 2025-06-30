import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class PostMessageContactSupportDto {
	@IsString()
	@MinLength(3)
	@MaxLength(100)
	@ApiProperty({
		description: 'Subject line',
		example: 'Request for support',
		minLength: 3,
		maxLength: 100,
		type: String
	})
	subject: string

	@IsString()
	@MinLength(5)
	@MaxLength(2000)
	@ApiProperty({
		description: 'Text of the message',
		example: 'Hello, I have a question for support',
		minLength: 5,
		maxLength: 2000,
		type: String
	})
	message: string
}
