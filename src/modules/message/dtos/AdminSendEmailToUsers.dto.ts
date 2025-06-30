import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class AdminSendEmailToUsersDto {
	@ApiProperty({
		description: 'List of recipient email addresses',
		example: ['admin1@example.com', 'admin2@example.com'],
		type: [String]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@IsOptional()
	@IsEmail({}, { each: true })
	sendTo?: string[]

	@IsString()
	@MinLength(3)
	@MaxLength(100)
	@ApiProperty({
		description: 'Email subject line',
		minLength: 3,
		maxLength: 100,
		type: String
	})
	subject: string

	@IsString()
	@MinLength(5)
	@MaxLength(2000)
	@ApiProperty({
		description: 'Body of the message',
		minLength: 5,
		maxLength: 2000,
		type: String
	})
	message: string
}
