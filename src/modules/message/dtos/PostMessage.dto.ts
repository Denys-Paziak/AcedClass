import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class PostMessageDto {
	@IsString({ message: 'Subject must be a string.' })
	@MinLength(3, { message: 'Subject must be at least 3 characters long.' })
	@MaxLength(100, { message: 'Subject must not exceed 100 characters.' })
	@ApiProperty({
		description: 'Тема повідомлення',
		example: 'Запит щодо документа',
		minLength: 3,
		maxLength: 100,
		type: String
	})
	subject: string

	@IsString({ message: 'Message must be a string.' })
	@MinLength(5, { message: 'Message must be at least 5 characters long.' })
	@MaxLength(2000, { message: 'Message must not exceed 2000 characters.' })
	@ApiProperty({
		description: 'Текст повідомлення',
		example: 'Доброго дня, я маю запит щодо цього документа.',
		minLength: 5,
		maxLength: 2000,
		type: String
	})
	message: string

	@IsInt({ message: 'Recipient ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'ID отримувача повідомлення',
		example: 123,
		type: Number,
		required: true
	})
	recipientId: number
}
