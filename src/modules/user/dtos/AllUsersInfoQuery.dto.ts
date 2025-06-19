import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class AllUsersInfoQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'The period of days must be an integer.' })
	@Min(1, { message: 'The value cannot be less than one.' })
	@ApiProperty({
		description: 'Період, за який потрібно отримати інформацію про користувачів (в днях)',
		example: 30,
		type: Number,
		required: false,
		minimum: 1
	})
	daysPeriod?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Upload count must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Мінімальна кількість завантажень користувача',
		example: 5,
		type: Number,
		required: false,
		minimum: 0
	})
	uploadCountMin?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Upload count must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Максимальна кількість завантажень користувача',
		example: 100,
		type: Number,
		required: false,
		minimum: 0
	})
	uploadCountMax?: number

	@IsOptional()
	@IsString({ message: 'Search string must be a string' })
	@ApiProperty({
		description: 'Пошук користувачів за іменем або email',
		example: 'John Doe'
	})
	search?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Кількість користувачів на сторінці для пагінації',
		example: 10,
		type: Number,
		required: false,
		minimum: 0
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Page must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Номер сторінки для пагінації',
		example: 1,
		type: Number,
		required: false,
		minimum: 0
	})
	page?: number
}
