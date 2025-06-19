import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { EComplaintFlags } from 'src/interfaces/EComplaintFlags'

export class PostComplaintDto {
	@IsEnum(EComplaintFlags, { message: 'Invalid complaint flag.' })
	@ApiProperty({
		description: 'Прапори скарги',
		example: EComplaintFlags.COPYRIGHT_VIOLATION,
		enum: EComplaintFlags,
		required: true
	})
	flag: EComplaintFlags

	@IsString({ message: 'Message must be a string.' })
	@MinLength(50, { message: 'Message must be at least 50 characters long.' })
	@MaxLength(1000, { message: 'Message must not exceed 1000 characters.' })
	@ApiProperty({
		description: 'Текст скарги',
		example: 'Цей документ порушує авторські права.',
		minLength: 50,
		maxLength: 1000,
		type: String,
		required: true
	})
	message: string

	@IsOptional()
	@IsInt({ message: 'User ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'ID користувача, який подає скаргу',
		example: 123,
		type: Number,
		required: false
	})
	userId?: number

	@IsOptional()
	@IsInt({ message: 'Document ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'ID документа, на який подається скарга',
		example: 456,
		type: Number,
		required: false
	})
	documentId?: number
}
