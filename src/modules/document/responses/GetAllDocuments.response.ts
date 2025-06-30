import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { DocumentResponse } from 'src/responses/Document.response'

export class GetAllDocumentsResponse {
	@ApiProperty({
		description: 'Page with documents',
		type: [DocumentResponse]
	})
	@Expose({ name: 'page' })
	@Type(() => DocumentResponse)
	page: DocumentResponse[]

	@ApiProperty({
		description: 'Total number of documents',
		example: 42,
		type: Number
	})
	@Expose({ name: 'total' })
	total: number
}
