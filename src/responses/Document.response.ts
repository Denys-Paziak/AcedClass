import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

import { UniversityResponse } from './University.response'

export class DocumentResponse {
	@ApiProperty({ description: 'Document ID', example: 9, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Document name', example: 'MainDocument.docx', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'Document university', type: UniversityResponse })
	@Expose({ name: 'university' })
	@Type(() => UniversityResponse)
	university: UniversityResponse

	@ApiProperty({ description: 'Course name to which the document belongs', example: 'Math 202', nullable: true, type: String })
	@Expose({ name: 'courseName' })
	courseName: string | null

	@ApiProperty({ description: 'Semester', example: 'Spring 2024', nullable: true, type: String })
	@Expose({ name: 'semester' })
	semester: string | null

	@ApiProperty({ description: 'Link to the document file', example: '/uploads/main_document.pdf', type: String })
	@Expose({ name: 'linkFile' })
	linkFile: string

	@ApiProperty({ description: 'Link to the document preview', example: '/uploads/main_document.png', type: String })
	@Expose({ name: 'linkPreview' })
	linkPreview: string

	@ApiProperty({ enum: EDocumentStatuses, description: 'Document status', example: EDocumentStatuses.PENDING })
	@Expose({ name: 'status' })
	status: EDocumentStatuses

	@ApiProperty({ description: 'Document creation date', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
