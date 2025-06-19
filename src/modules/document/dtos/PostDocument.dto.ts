import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class PostDocumentDto {
	@ApiPropertyOptional({
		description: 'ID університету, до якого належить документ',
		type: Number,
		minimum: 0,
		example: 5
	})
	@IsOptional()
	@IsInt({ message: 'University ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@Type(() => Number)
	universityId?: number

	@ApiPropertyOptional({
		description: 'Назва курсу',
		type: String,
		example: 'Art History',
		maxLength: 100
	})
	@IsOptional()
	@IsString({ message: 'Class name must be a string.' })
	@MaxLength(100, { message: 'Class name must be at most 100 characters long.' })
	courseName?: string
}
