import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class PostMessageDto {
	@IsString()
	@MinLength(3)
	@MaxLength(100)
	@ApiProperty({
		description: 'Subject line',
		example: 'Request for a document',
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
		example: 'Hello, I have a request regarding this document',
		minLength: 5,
		maxLength: 2000,
		type: String
	})
	message: string

	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Recipient ID of the message',
		example: 123,
		type: Number,
		required: true
	})
	recipientId: number
}
