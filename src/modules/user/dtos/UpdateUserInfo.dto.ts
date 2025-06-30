import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class UpdateUserInfoDto {
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
}
