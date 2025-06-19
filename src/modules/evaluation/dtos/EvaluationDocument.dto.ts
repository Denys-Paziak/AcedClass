import { ApiProperty } from '@nestjs/swagger'
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { EEvaluationTags } from 'src/interfaces/EEvaluationTags'
import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { Document } from 'src/modules/document/entities/Document.entity'

export class EvaluationDocumentDto {
	@IsEnum(EEvaluationTypes, { message: 'Invalid evaluation type.' })
	@ApiProperty({
		description: 'Тип оцінки документа',
		example: EEvaluationTypes.LIKE,
		enum: EEvaluationTypes,
		type: String
	})
	type: EEvaluationTypes

	@IsOptional()
	@IsArray({ message: 'Tags must be an array.' })
	@ArrayUnique({ message: 'Tags must be unique.' })
	@IsEnum(EEvaluationTags, {
		each: true,
		message: 'Each tag must be a valid evaluation tag.'
	})
	@ApiProperty({
		description: 'Мітки оцінки документа',
		example: [EEvaluationTags.COMPLETE_DOCUMENT, EEvaluationTags.INACCURATE_INFO],
		enum: EEvaluationTags,
		type: [String],
		required: false
	})
	tags?: EEvaluationTags[]

	@IsInt({ message: 'Document ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'ID документа, який оцінюється',
		example: 123,
		type: Number,
		required: true
	})
	documentId: Document['id']
}
