import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ChangeInfoDocumentDto {
	@ApiPropertyOptional({
		description: 'Нова назва документа',
		type: String,
		example: 'Lecture Notes 2024'
	})
	@IsOptional()
	@IsString({ message: 'Document name must be a string' })
	name?: string

	@ApiPropertyOptional({
		description: 'ID університету',
		type: Number,
		minimum: 0,
		example: 2
	})
	@IsOptional()
	@IsInt({ message: 'University ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	universityId?: number

	@ApiPropertyOptional({
		description: 'Назва курсу',
		type: String,
		example: 'CS101 - Introduction to Programming'
	})
	@IsOptional()
	@IsString({ message: 'Course name must be a string' })
	courseName?: string
}
