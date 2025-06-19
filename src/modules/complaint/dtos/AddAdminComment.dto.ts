import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class AddAdminCommentDto {
	@IsString({ message: 'Admin comment must be a string.' })
	@MinLength(3, { message: 'Admin comment must be at least 3 characters long.' })
	@MaxLength(1000, { message: 'Admin comment must not exceed 1000 characters.' })
	@ApiProperty({
		description: 'Коментар адміністратора',
		example: 'Цей документ потребує додаткової перевірки.',
		minLength: 3,
		maxLength: 1000,
		type: String
	})
	adminComment: string
}
