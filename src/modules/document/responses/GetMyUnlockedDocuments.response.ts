import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { DocumentResponse } from 'src/responses/Document.response'

export class GetMyUnlockedDocumentsResponse {
	@ApiProperty({
		description: 'ID розблокування',
		example: 101,
		type: Number
	})
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ enum: EPointTypes, description: 'Тип валюти', example: EPointTypes.POINT })
	@Expose({ name: 'pointType' })
	pointType: EPointTypes

	@ApiProperty({ description: 'Документ, який було розблоковано', type: DocumentResponse })
	@Expose({ name: 'document' })
	@Type(() => DocumentResponse)
	document: DocumentResponse

	@ApiProperty({ description: 'Дата створення', example: '2024-06-15T10:30:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
