import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, Length } from 'class-validator'

export class SendCodeDto {
	@ApiProperty({
		description: 'Код підтвердження, що складається з 6 цифр',
		example: '123456',
		minLength: 6,
		maxLength: 6,
		type: String
	})
	@IsNumberString({ no_symbols: true }, { message: 'Code must contain only digits.' })
	@Length(6, 6, { message: 'Code must be exactly 6 characters long.' })
	code: string
}
