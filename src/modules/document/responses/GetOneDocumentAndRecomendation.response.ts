import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { UniversityResponse } from 'src/responses/University.response'

class Recommendation {
	@ApiProperty({ description: 'ID документа-рекомендації', example: 22, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Назва документа', example: 'RecommendedDoc.docx', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'Посилання на превʼю документа', example: '/previews/recommendation.jpg', type: String })
	@Expose({ name: 'linkPreview' })
	linkPreview: string

	@ApiProperty({ description: 'Університет документа', type: UniversityResponse, nullable: true })
	@Expose({ name: 'university' })
	@Type(() => UniversityResponse)
	university: UniversityResponse | null

	@ApiProperty({ description: 'Назва курсу, до якого належить документ', example: 'Philosophy 101', nullable: true })
	@Expose({ name: 'courseName' })
	courseName: string | null

	@ApiProperty({ description: 'Кількість переглядів', example: 123, type: Number })
	@Expose({ name: 'numberViews' })
	numberViews: number
}

export class GetOneDocumentAndRecomendationResponse {
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

	@ApiProperty({ description: 'Дата створення документа', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date

	@ApiProperty({ description: 'Кількість сторінок у документі', example: 17, type: Number })
	@Expose({ name: 'pageCount' })
	pageCount: number

	@ApiProperty({ description: 'Кількість переглядів', example: 98, type: Number })
	@Expose({ name: 'numberViews' })
	numberViews: number

	@ApiProperty({ description: 'Кількість розблокувань документа', example: 25, type: Number })
	@Expose({ name: 'numberRevealed' })
	numberRevealed: number

	@ApiProperty({ description: 'Середній рейтинг документа', example: 4.5, type: Number })
	@Expose({ name: 'rating' })
	rating: number

	@ApiProperty({ description: 'Список рекомендованих документів, перші 6 по переглядах', type: [Recommendation] })
	@Expose({ name: 'revealChain' })
	@Type(() => Recommendation)
	revealChain: Recommendation[]

	@ApiProperty({ description: 'Список рекомендованих документів, останні 6 по переглядах', type: [Recommendation] })
	@Expose({ name: 'recommendations' })
	@Type(() => Recommendation)
	recommendations: Recommendation[]

	@ApiProperty({ description: 'Чи є документ розблокованим для користувача', example: true, type: Boolean })
	@Expose({ name: 'isUnlocked' })
	isUnlocked: boolean
}
