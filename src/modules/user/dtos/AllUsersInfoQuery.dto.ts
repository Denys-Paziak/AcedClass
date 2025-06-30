import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class AllUsersInfoQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@ApiProperty({
		description: 'Period to retrieve user info for (in days)',
		example: 30,
		type: Number,
		required: false,
		minimum: 1
	})
	daysPeriod?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Minimum number of user uploads',
		example: 5,
		type: Number,
		required: false,
		minimum: 0
	})
	uploadCountMin?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Maximum number of user uploads',
		example: 100,
		type: Number,
		required: false,
		minimum: 0
	})
	uploadCountMax?: number

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Search users by name or email',
		example: 'John Doe'
	})
	search?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of users per page for pagination',
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
