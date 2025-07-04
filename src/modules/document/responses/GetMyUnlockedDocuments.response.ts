import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EPointTypes } from '../../../interfaces/EPointTypes'
import { DocumentResponse } from '../../../responses/Document.response'

export class GetMyUnlockedDocumentsResponse {
	@ApiProperty({
		description: 'Unlock ID',
		example: 101,
		type: Number
	})
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ enum: EPointTypes, description: 'Currency type', example: EPointTypes.POINT })
	@Expose({ name: 'pointType' })
	pointType: EPointTypes

	@ApiProperty({ description: 'The document that was unlocked', type: DocumentResponse })
	@Expose({ name: 'document' })
	@Type(() => DocumentResponse)
	document: DocumentResponse

	@ApiProperty({ description: 'Date of creation', example: '2024-06-15T10:30:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
