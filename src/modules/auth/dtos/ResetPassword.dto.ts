import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, MaxLength, MinLength, Validate } from 'class-validator'
import { IsPasswordsEqual } from 'src/decorators/is-passwords-equal.decorator'

export class ResetPasswordDto {
	@ApiProperty({
		description: 'UUID token used to reset the password',
		example: 'd4f6c5e8-1df0-4a25-95b7-fd3d8d4cc9ae',
		type: String,
		format: 'uuid'
	})
	@IsUUID(4)
	token: string

	@ApiProperty({
		description: 'New password',
		example: 'newPassword123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString()
	@MinLength(6)
	@MaxLength(64)
	password: string

	@ApiProperty({
		description: 'Confirm the new password (must match the "password" field)',
		example: 'newPassword123',
		minLength: 6,
		maxLength: 64,
		type: String
	})
	@IsString()
	@MinLength(6)
	@MaxLength(64)
	@Validate(IsPasswordsEqual)
	passwordConfirmation: string
}
