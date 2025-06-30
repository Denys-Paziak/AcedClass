import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ChangeInfoDocumentDto {
	@ApiPropertyOptional({
		description: 'New name of the document',
		type: String,
		example: 'Lecture Notes 2024'
	})
	@IsOptional()
	@IsString()
	name?: string

	@ApiPropertyOptional({
		description: 'University ID',
		type: Number,
		minimum: 0,
		example: 2
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	universityId?: number

	@ApiPropertyOptional({
		description: 'Course title',
		type: String,
		example: 'CS101 - Introduction to Programming'
	})
	@IsOptional()
	@IsString()
	courseName?: string
}
