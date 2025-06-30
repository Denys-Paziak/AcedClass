import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'

export class TopUsersQueryDto {
	@IsEnum([1, 7, 30, 90])
	@Type(() => Number)
	@ApiProperty({
		description: 'Number of days to analyze platform activity',
		example: 30,
		enum: [1, 7, 30, 90],
		type: Number
	})
	rangeDays: 1 | 7 | 30 | 90

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of users to return in the results',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Page number for pagination of results',
		example: 1,
		type: Number,
		required: false
	})
	page?: number
}
