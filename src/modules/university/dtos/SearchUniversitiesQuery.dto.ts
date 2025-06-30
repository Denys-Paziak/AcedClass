import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class SearchUniversitiesQueryDto {
	@IsString()
	@MinLength(5)
	@ApiProperty({
		description: 'Search universities by name',
		example: 'National University',
		type: String
	})
	search: string

	@IsOptional()
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of results per page',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number
}
