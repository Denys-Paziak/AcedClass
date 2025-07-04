import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { UniversityResponse } from '../../../responses/University.response'

class Recommendation {
	@ApiProperty({ description: 'ID of the recommended document', example: 22, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Name of the document', example: 'RecommendedDoc.docx', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'Link to the document preview', example: '/previews/recommendation.jpg', type: String })
	@Expose({ name: 'linkPreview' })
	linkPreview: string

	@ApiProperty({ description: 'University associated with the document', type: UniversityResponse, nullable: true })
	@Expose({ name: 'university' })
	@Type(() => UniversityResponse)
	university: UniversityResponse | null

	@ApiProperty({ description: 'Course name the document belongs to', example: 'Philosophy 101', nullable: true })
	@Expose({ name: 'courseName' })
	courseName: string | null

	@ApiProperty({ description: 'Number of views', example: 123, type: Number })
	@Expose({ name: 'numberViews' })
	numberViews: number
}

export class GetOneDocumentAndRecomendationResponse {
	@ApiProperty({ description: 'Document ID', example: 9, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Name of the document', example: 'MainDocument.docx', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'University associated with the document', type: UniversityResponse })
	@Expose({ name: 'university' })
	@Type(() => UniversityResponse)
	university: UniversityResponse

	@ApiProperty({ description: 'Course name the document belongs to', example: 'Math 202', nullable: true, type: String })
	@Expose({ name: 'courseName' })
	courseName: string | null

	@ApiProperty({ description: 'Semester', example: 'Spring 2024', nullable: true, type: String })
	@Expose({ name: 'semester' })
	semester: string | null

	@ApiProperty({ description: 'Link to the document file', example: '/uploads/main_document.pdf', type: String })
	@Expose({ name: 'linkFile' })
	linkFile: string

	@ApiProperty({ description: 'Document creation date', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date

	@ApiProperty({ description: 'Number of pages in the document', example: 17, type: Number })
	@Expose({ name: 'pageCount' })
	pageCount: number

	@ApiProperty({ description: 'Number of views', example: 98, type: Number })
	@Expose({ name: 'numberViews' })
	numberViews: number

	@ApiProperty({ description: 'Number of times the document has been unlocked', example: 25, type: Number })
	@Expose({ name: 'numberRevealed' })
	numberRevealed: number

	@ApiProperty({ description: 'Average document rating', example: 4.5, type: Number })
	@Expose({ name: 'rating' })
	rating: number

	@ApiProperty({ description: 'List of recommended documents (top 6 by views)', type: [Recommendation] })
	@Expose({ name: 'revealChain' })
	@Type(() => Recommendation)
	revealChain: Recommendation[]

	@ApiProperty({ description: 'List of recommended documents (last 6 by views)', type: [Recommendation] })
	@Expose({ name: 'recommendations' })
	@Type(() => Recommendation)
	recommendations: Recommendation[]

	@ApiProperty({ description: 'Indicates whether the document is unlocked for the user', example: true, type: Boolean })
	@Expose({ name: 'isUnlocked' })
	isUnlocked: boolean
}
