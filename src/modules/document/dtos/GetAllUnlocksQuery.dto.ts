import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class GetAllUnlocksQueryDto {
	@ApiPropertyOptional({
		description: 'Дата створення розблокування для фільтрації',
		type: String,
		format: 'date-time',
		example: '2024-06-14T12:00:00.000Z'
	})
	@IsOptional()
	@Type(() => Date)
	@IsDate({ message: 'CreatedAt must be a valid date' })
	createdAt?: Date

	@ApiPropertyOptional({
		description: 'Пошук по назві документа або користувачу (username або email)',
		type: String,
		example: 'chemistry'
	})
	@IsOptional()
	@IsString({ message: 'Search string must be a string' })
	search?: string

	@ApiPropertyOptional({
		description: 'Кількість результатів на сторінку',
		type: Number,
		minimum: 0,
		example: 20
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	limit?: number

	@ApiPropertyOptional({
		description: 'Номер сторінки',
		type: Number,
		minimum: 0,
		example: 0
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Page must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	page?: number
}
