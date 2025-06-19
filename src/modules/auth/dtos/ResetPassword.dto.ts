import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, MaxLength, MinLength, Validate } from 'class-validator'
import { IsPasswordsEqual } from 'src/decorators/is-passwords-equal.decorator'

export class ResetPasswordDto {
	@ApiProperty({
		description: 'UUID токен, що використовується для скидання пароля',
		example: 'd4f6c5e8-1df0-4a25-95b7-fd3d8d4cc9ae',
		type: String,
		format: 'uuid'
	})
	@IsUUID(4, { message: 'Invalid token format.' })
	token: string

	@ApiProperty({
		description: 'Новий пароль',
		example: 'newPassword123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString({ message: 'Password must be a string.' })
	@MinLength(6, { message: 'Password must be at least 6 characters long.' })
	@MaxLength(64, { message: 'Password must not exceed 64 characters.' })
	password: string

	@ApiProperty({
		description: 'Підтвердження нового пароля (має збігатись з полем "password")',
		example: 'newPassword123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString({ message: 'Password confirmation must be a string.' })
	@MinLength(6, {
		message: 'Password confirmation must be at least 6 characters long.'
	})
	@MaxLength(64, { message: 'Password confirmation must not exceed 64 characters.' })
	@Validate(IsPasswordsEqual)
	passwordConfirmation: string
}
