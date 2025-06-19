import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class ForgotPasswordDto {
	@ApiProperty({
		description: 'Електронна пошта користувача для скидання пароля',
		example: 'example@email.com',
		type: String,
		format: 'email',
	})
	@IsString({ message: 'Email must be a string.' })
	@IsEmail({}, { message: 'Invalid email format.' })
	email: string
}
