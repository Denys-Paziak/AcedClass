import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
	@ApiProperty({
		description: 'User email address',
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	@IsString()
	@IsEmail()
	email: string

	@ApiProperty({
		description: 'Password user',
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
