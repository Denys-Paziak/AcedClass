import { ApiProperty } from '@nestjs/swagger'
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { EEvaluationTags } from 'src/interfaces/EEvaluationTags'
import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { Document } from 'src/modules/document/entities/Document.entity'

export class EvaluationDocumentDto {
	@IsEnum(EEvaluationTypes)
	@ApiProperty({
		description: 'Type of document evaluation',
		example: EEvaluationTypes.LIKE,
		enum: EEvaluationTypes,
		type: String
	})
	type: EEvaluationTypes

	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsEnum(EEvaluationTags, {
		each: true
	})
	@ApiProperty({
		description: 'Document evaluation marks',
		example: [EEvaluationTags.COMPLETE_DOCUMENT, EEvaluationTags.INACCURATE_INFO],
		enum: EEvaluationTags,
		type: [String],
		required: false
	})
	tags?: EEvaluationTags[]

	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'ID of the document being evaluated',
		example: 123,
		type: Number,
		required: true
	})
	documentId: Document['id']
}
