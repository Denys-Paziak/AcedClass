import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EComplaintFlags } from 'src/interfaces/EComplaintFlags'
import { EComplaintStatus } from 'src/interfaces/EComplaintStatus'
import { DocumentResponse } from 'src/responses/Document.response'
import { UserResponse } from 'src/responses/User.response'

class Complaint {
	@Expose({ name: 'id' })
	@ApiProperty({ description: 'Унікальний ідентифікатор скарги', example: 1, type: Number })
	id: number

	@Expose({ name: 'flag' })
	@ApiProperty({
		description: 'Прапор скарги',
		example: EComplaintFlags.COPYRIGHT_VIOLATION,
		enum: EComplaintFlags,
		type: String
	})
	flag: EComplaintFlags

	@Expose({ name: 'message' })
	@ApiProperty({
		description: 'Текст скарги',
		example: 'Цей документ порушує авторські права.',
		type: String
	})
	message: string

	@Expose({ name: 'adminComment' })
	@ApiProperty({
		description: 'Коментар адміністратора',
		example: 'Цей документ потребує додаткової перевірки.',
		type: String
	})
	adminComment: string

	@Expose({ name: 'status' })
	@ApiProperty({
		description: 'Статус скарги',
		example: EComplaintStatus.PENDING,
		enum: EComplaintStatus,
		type: String
	})
	status: EComplaintStatus

	@Expose({ name: 'author' })
	@Type(() => UserResponse)
	@ApiProperty({
		description: 'Автор скарги',
		type: UserResponse,
		nullable: true
	})
	author: UserResponse | null

	@Expose({ name: 'user' })
	@Type(() => UserResponse)
	@ApiProperty({
		description: 'Користувач, на якого подана скарга',
		type: UserResponse,
		nullable: true
	})
	user: UserResponse | null

	@Expose({ name: 'document' })
	@Type(() => DocumentResponse)
	@ApiProperty({
		description: 'Документ, на який подана скарга',
		type: DocumentResponse,
		nullable: true
	})
	document: DocumentResponse | null

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Дата створення скарги',
		example: '2023-01-01T00:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'updatedAt' })
	@ApiProperty({
		description: 'Дата останнього оновлення скарги',
		example: '2023-01-02T00:00:00Z',
		type: Date
	})
	updatedAt: Date
}

export class GetAllComplaintsResponse {
	@Expose({ name: 'page' })
	@Type(() => Complaint)
	@ApiProperty({ description: 'Сторінка зі скаргами', type: [Complaint] })
	page: Complaint[]

	@Expose({ name: 'total' })
	@ApiProperty({ description: 'Загальна кількість скарг', example: 42, type: Number })
	total: number
}
