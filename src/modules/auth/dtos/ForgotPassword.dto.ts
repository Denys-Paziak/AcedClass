import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class ForgotPasswordDto {
	@ApiProperty({
		description: 'User email to reset password',
		example: 'example@email.com',
		type: String,
		format: 'email',
	})
	@IsString()
	@IsEmail({})
	email: string
}
