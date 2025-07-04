import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { EDocumentStatuses } from '../../../interfaces/EDocumentStatuses'

export class GetAllDocumentsQueryDto {
	@ApiPropertyOptional({
		description: 'Filter by university name',
		type: String,
		example: 'Harvard University'
	})
	@IsOptional()
	@IsString()
	university?: string

	@ApiPropertyOptional({
		description: 'Filter by course name',
		type: String,
		example: 'Macroeconomics'
	})
	@IsOptional()
	@IsString()
	courseName?: string

	@ApiPropertyOptional({
		description: 'Filter by document creation date',
		type: String,
		format: 'date-time',
		example: '2024-06-15T00:00:00.000Z'
	})
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	createdAt?: Date

	@ApiPropertyOptional({
		description: 'Filter by document status',
		enum: EDocumentStatuses,
		example: EDocumentStatuses.PENDING
	})
	@IsOptional()
	@IsEnum(EDocumentStatuses)
	status?: EDocumentStatuses

	@ApiPropertyOptional({
		description: 'Search string to filter documents',
		type: String,
		example: 'calculus'
	})
	@IsOptional()
	@IsString()
	search?: string

	@ApiPropertyOptional({
		description: 'Number of items per page',
		type: Number,
		minimum: 0,
		example: 10
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	limit?: number

	@ApiPropertyOptional({
		description: 'Page number for pagination',
		type: Number,
		minimum: 0,
		example: 1
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	page?: number
}
