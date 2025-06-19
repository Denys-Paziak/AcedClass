import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class RegistrationDto {
	@ApiProperty({
		description: 'Електронна пошта нового користувача',
		example: 'newuser@example.com',
		type: String,
		format: 'email'
	})
	@IsString({ message: 'Email must be a string.' })
	@IsEmail({}, { message: 'Invalid email format.' })
	email: string

	@ApiProperty({
		description: 'Пароль нового користувача',
		example: 'StrongPass123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString({ message: 'Password must be a string.' })
	@MinLength(6, { message: 'Password must be at least 6 characters long.' })
	@MaxLength(64, { message: 'Password must not exceed 64 characters.' })
	password: string
}
