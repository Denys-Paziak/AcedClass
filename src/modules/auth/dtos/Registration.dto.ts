import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class RegistrationDto {
	@ApiProperty({
		description: "New user's email address",
		example: 'newuser@example.com',
		type: String,
		format: 'email'
	})
	@IsString()
	@IsEmail()
	email: string

	@ApiProperty({
		description: 'New user password',
		example: 'StrongPass123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString()
	@MinLength(6)
	@MaxLength(64)
	password: string
}
