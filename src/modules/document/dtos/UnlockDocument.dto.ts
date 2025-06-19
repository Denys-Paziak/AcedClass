import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, Min } from 'class-validator'
import { EPointTypes } from 'src/interfaces/EPointTypes'

import { Document } from '../../document/entities/Document.entity'

export class UnlockDocumentDto {
	@ApiProperty({
		description: 'Тип використаних поінтів для розблокування',
		enum: EPointTypes,
		example: EPointTypes.POINT
	})
	@IsEnum(EPointTypes, { message: 'Point type must be a valid EPointTypes value' })
	pointType: EPointTypes

	@ApiProperty({
		description: 'ID документа, який потрібно розблокувати',
		type: Number,
		example: 8,
		minimum: 0
	})
	@IsInt({ message: 'The document identifier must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	documentId: Document['id']
}
