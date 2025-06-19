import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class UpdateUserInfoDto {
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
}
