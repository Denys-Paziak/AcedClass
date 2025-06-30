import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { UniversityResponse } from 'src/responses/University.response'

class Document {
	@ApiProperty({ description: 'Document ID', example: 9, type: Number })
	@Expose({ name: 'document_id' })
	id: number

	@ApiProperty({ description: 'Document name', example: 'MainDocument.docx', type: String })
	@Expose({ name: 'document_name' })
	name: string

	@ApiProperty({ description: 'System filename of the document', example: 'MainDocument.docx', type: String })
	@Expose({ name: 'document_system_name' })
	systemName: string

	@ApiProperty({
		description: 'Short description of the document',
		example: 'A basic introductory math document',
		type: String
	})
	@Expose({ name: 'document_description' })
	description: string

	@ApiProperty({ description: 'University associated with the document', type: UniversityResponse })
	@Expose()
	@Transform(({ obj }) => ({
		id: obj.university_id,
		name: obj.university_name
	}))
	university: UniversityResponse

	@ApiProperty({
		description: 'Course name the document is associated with',
		example: 'Math 202',
		nullable: true,
		type: String
	})
	@Expose({ name: 'document_course_name' })
	courseName: string | null

	@ApiProperty({
		description: 'Link to the document preview image',
		example: '/uploads/main_document.png',
		type: String
	})
	@Expose({ name: 'document_link_preview' })
	linkPreview: string

	@ApiProperty({ description: 'Number of views', example: 43, type: Number })
	@Expose({ name: 'document_number_views' })
	numberViews: number

	@ApiProperty({ description: 'Number of pages in the document', example: 12, type: Number })
	@Expose({ name: 'document_page_count' })
	pageCount: number
}

export class SearchResponse {
	@ApiProperty({
		description: 'Page of documents',
		type: [Document]
	})
	@Expose({ name: 'page' })
	@Type(() => Document)
	page: Document[]

	@ApiProperty({
		description: 'Total number of documents',
		example: 42,
		type: Number
	})
	@Expose({ name: 'total' })
	total: number
}
