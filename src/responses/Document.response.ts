import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

import { UniversityResponse } from './University.response'

export class DocumentResponse {
	@ApiProperty({ description: 'ID документа', example: 9, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Назва документа', example: 'MainDocument.docx', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'Університет документа', type: UniversityResponse })
	@Expose({ name: 'university' })
	@Type(() => UniversityResponse)
	university: UniversityResponse

	@ApiProperty({ description: 'Назва курсу, до якого належить документ', example: 'Math 202', nullable: true, type: String })
	@Expose({ name: 'courseName' })
	courseName: string | null

	@ApiProperty({ description: 'Семестр', example: 'Spring 2024', nullable: true, type: String })
	@Expose({ name: 'semester' })
	semester: string | null

	@ApiProperty({ description: 'Посилання на файл документа', example: '/uploads/main_document.pdf', type: String })
	@Expose({ name: 'linkFile' })
	linkFile: string

	@ApiProperty({ description: "Посилання на прев'ю документа", example: '/uploads/main_document.png', type: String })
	@Expose({ name: 'linkPreview' })
	linkPreview: string

	@ApiProperty({ enum: EDocumentStatuses, description: 'Статус документа', example: EDocumentStatuses.PENDING })
	@Expose({ name: 'status' })
	status: EDocumentStatuses

	@ApiProperty({ description: 'Дата створення документа', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
