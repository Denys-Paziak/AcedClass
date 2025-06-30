import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class SearchQueryDto {
	@IsString()
	@IsOptional()
	search?: string

	@IsString()
	@IsOptional()
	courseName?: string
	@IsString()
	@IsOptional()
	university?: string

	@IsEnum(['ASC', 'DESC'])
	@IsOptional()
	sortByCreatedAt?: 'ASC' | 'DESC'
	@IsEnum(['ASC', 'DESC'])
	@IsOptional()
	sortByLikesCount?: 'ASC' | 'DESC'

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of complaints per page',
		example: 10,
		type: Number,
		required: false,
		minimum: 0
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Page number for pagination',
		example: 1,
		type: Number,
		required: false,
		minimum: 0
	})
	page?: number
}
