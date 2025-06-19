import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class SearchUniversitiesQueryDto {
	@IsString({ message: 'Search string must be a string.' })
	@MinLength(5, { message: 'Search string must be at least 5 characters long.' })
	@ApiProperty({
		description: 'Пошук університетів за назвою',
		example: 'National University',
		type: String
	})
	search: string

	@IsOptional()
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Кількість результатів на сторінці',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number
}
