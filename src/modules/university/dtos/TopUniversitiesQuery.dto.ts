import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, Min } from 'class-validator'

export class TopUniversitiesQueryDto {
	@IsOptional()
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Кількість університетів для повернення в результатах',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number
}
