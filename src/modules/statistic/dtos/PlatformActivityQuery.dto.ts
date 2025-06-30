import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum } from 'class-validator'

export class PlatformActivityQueryDto {
	@IsEnum([1, 7, 30, 90])
	@Type(() => Number)
	@ApiProperty({
		description: 'Number of days to analyze platform activity',
		example: 30,
		enum: [1, 7, 30, 90],
		type: Number
	})
	rangeDays: 1 | 7 | 30 | 90
}
