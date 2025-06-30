import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, Min } from 'class-validator'

export class TopUniversitiesQueryDto {
	@IsOptional()
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of universities to return in the results',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number
}
