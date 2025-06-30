import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class GetAllUnlocksQueryDto {
	@ApiPropertyOptional({
		description: 'Date of creation of the unlock for filtering',
		type: String,
		format: 'date-time',
		example: '2024-06-14T12:00:00.000Z'
	})
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	createdAt?: Date

	@ApiPropertyOptional({
		description: 'Search by document name or user (username or email)',
		type: String,
		example: 'chemistry'
	})
	@IsOptional()
	@IsString()
	search?: string

	@ApiPropertyOptional({
		description: 'Number of results per page',
		type: Number,
		minimum: 0,
		example: 20
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	limit?: number

	@ApiPropertyOptional({
		description: 'Page number',
		type: Number,
		minimum: 0,
		example: 0
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	page?: number
}
