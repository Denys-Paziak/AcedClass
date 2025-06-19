import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum } from 'class-validator'

export class PlatformActivityQueryDto {
	@IsEnum([1, 7, 30, 90], {
		message: 'Range days must be one of the following values: 1, 7, 30, or 90.'
	})
	@Type(() => Number)
	@ApiProperty({
		description: 'Кількість днів для аналізу активності платформи',
		example: 30,
		enum: [1, 7, 30, 90],
		type: Number
	})
	rangeDays: 1 | 7 | 30 | 90
}
