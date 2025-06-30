import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, Length } from 'class-validator'

export class SendCodeDto {
	@ApiProperty({
		description: 'Confirmation code consisting of 6 digits',
		example: '123456',
		minLength: 6,
		maxLength: 6,
		type: String
	})
	@IsNumberString({ no_symbols: true })
	@Length(6, 6)
	code: string
}
