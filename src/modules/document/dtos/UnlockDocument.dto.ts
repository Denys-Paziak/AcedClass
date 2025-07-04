import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, Min } from 'class-validator'
import { EPointTypes } from '../../../interfaces/EPointTypes'

export class UnlockDocumentDto {
	@ApiProperty({
		description: 'Type of points used to unlock',
		enum: EPointTypes,
		example: EPointTypes.POINT
	})
	@IsEnum(EPointTypes)
	pointType: EPointTypes

	@ApiProperty({
		description: 'ID of the document to be unlocked',
		type: Number,
		example: 8,
		minimum: 0
	})
	@IsInt()
	@Min(0)
	documentId: number
}
