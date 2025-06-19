import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateUserInfoAndEmailDto {
	@IsString({ message: 'The name must be a string.' })
	@IsOptional()
	@ApiProperty({
		description: "Ім'я користувача",
		example: 'John',
		type: String,
		required: false
	})
	firstName?: string

	@IsString({ message: 'The last name must be a string.' })
	@IsOptional()
	@ApiProperty({
		description: 'Прізвище користувача',
		example: 'Doe',
		type: String,
		required: false
	})
	lastName?: string

	@IsPhoneNumber(undefined, { message: 'Incorrect phone format.' })
	@IsOptional()
	@ApiProperty({
		description: 'Номер телефону користувача',
		example: '+380501234567',
		type: String,
		required: false
	})
	phone?: string

	@IsString({ message: 'Email must be a string.' })
	@IsEmail({}, { message: 'The email format is incorrect.' })
	@ApiProperty({
		description: 'Електронна пошта користувача',
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@IsString({ message: 'Password must be a string.' })
	@MinLength(6, { message: 'Password must be at least 6 characters long.' })
	@MaxLength(64, { message: 'Password must not exceed 64 characters.' })
	@ApiProperty({
		description: 'Пароль користувача',
		example: 'StrongPass123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	password: string
}
