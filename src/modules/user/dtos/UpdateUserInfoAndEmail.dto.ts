import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateUserInfoAndEmailDto {
	@IsString()
	@IsOptional()
	@ApiProperty({
		description: "User's first name",
		example: 'John',
		type: String,
		required: false
	})
	firstName?: string

	@IsString()
	@IsOptional()
	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
		type: String,
		required: false
	})
	lastName?: string

	@IsPhoneNumber()
	@IsOptional()
	@ApiProperty({
		description: "User's phone number",
		example: '+380501234567',
		type: String,
		required: false
	})
	phone?: string

	@IsString()
	@IsEmail()
	@ApiProperty({
		description: "User's email address",
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@IsString()
	@MinLength(6)
	@MaxLength(64)
	@ApiProperty({
		description: "User's password",
		example: 'StrongPass123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	password: string
}
