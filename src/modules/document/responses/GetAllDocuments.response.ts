import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { DocumentResponse } from 'src/responses/Document.response'

export class GetAllDocumentsResponse {
	@ApiProperty({
		description: 'Сторінка з документами',
		type: [DocumentResponse]
	})
	@Expose({ name: 'page' })
	@Type(() => DocumentResponse)
	page: DocumentResponse[]

	@ApiProperty({
		description: 'Загальна кількість документів',
		example: 42,
		type: Number
	})
	@Expose({ name: 'total' })
	total: number
}
