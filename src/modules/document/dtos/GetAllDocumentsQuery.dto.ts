import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

export class GetAllDocumentsQueryDto {
	@ApiPropertyOptional({
		description: 'Фільтрація за назвою університету',
		type: String,
		example: 'Harvard University'
	})
	@IsOptional()
	@IsString({ message: 'University must be a string' })
	university?: string

	@ApiPropertyOptional({
		description: 'Фільтрація за назвою курсу',
		type: String,
		example: 'Macroeconomics'
	})
	@IsOptional()
	@IsString({ message: 'Course name must be a string' })
	courseName?: string

	@ApiPropertyOptional({
		description: 'Дата створення документа для фільтрації',
		type: String,
		format: 'date-time',
		example: '2024-06-15T00:00:00.000Z'
	})
	@IsOptional()
	@Type(() => Date)
	@IsDate({ message: 'CreatedAt must be a valid date' })
	createdAt?: Date

	@ApiPropertyOptional({
		description: 'Статус документа для фільтрації',
		enum: EDocumentStatuses,
		example: EDocumentStatuses.PENDING
	})
	@IsOptional()
	@IsEnum(EDocumentStatuses, { message: 'Status must be a valid document status' })
	status?: EDocumentStatuses

	@ApiPropertyOptional({
		description: 'Пошуковий рядок для фільтрації документів',
		type: String,
		example: 'calculus'
	})
	@IsOptional()
	@IsString({ message: 'Search string must be a string' })
	search?: string

	@ApiPropertyOptional({
		description: 'Кількість елементів на сторінку',
		type: Number,
		minimum: 0,
		example: 10
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	limit?: number

	@ApiPropertyOptional({
		description: 'Номер сторінки для пагінації',
		type: Number,
		minimum: 0,
		example: 1
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Page must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	page?: number
}
