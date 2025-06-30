import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class PostDocumentDto {
	@ApiPropertyOptional({
		description: 'ID of the university to which the document belongs',
		type: Number,
		minimum: 0,
		example: 5
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	@Type(() => Number)
	universityId?: number

	@ApiPropertyOptional({
		description: 'Course title',
		type: String,
		example: 'Art History',
		maxLength: 100
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	courseName?: string
}
