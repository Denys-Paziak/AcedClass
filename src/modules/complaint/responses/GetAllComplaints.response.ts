import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EComplaintFlags } from '../../../interfaces/EComplaintFlags'
import { EComplaintStatus } from '../../../interfaces/EComplaintStatus'
import { DocumentResponse } from '../../../responses/Document.response'
import { UserResponse } from '../../../responses/User.response'

class Complaint {
	@Expose({ name: 'id' })
	@ApiProperty({ description: 'Unique complaint identifier', example: 1, type: Number })
	id: number

	@Expose({ name: 'flag' })
	@ApiProperty({
		description: 'Complaint flag',
		example: EComplaintFlags.COPYRIGHT_VIOLATION,
		enum: EComplaintFlags,
		type: String
	})
	flag: EComplaintFlags

	@Expose({ name: 'message' })
	@ApiProperty({
		description: 'Text of the complaint',
		example: 'Цей документ порушує авторські права.',
		type: String
	})
	message: string

	@Expose({ name: 'adminComment' })
	@ApiProperty({
		description: 'Administrator comment',
		example: 'This document requires additional verification.',
		type: String
	})
	adminComment: string

	@Expose({ name: 'status' })
	@ApiProperty({
		description: 'Status of the complaint',
		example: EComplaintStatus.PENDING,
		enum: EComplaintStatus,
		type: String
	})
	status: EComplaintStatus

	@Expose({ name: 'author' })
	@Type(() => UserResponse)
	@ApiProperty({
		description: 'Author of the complaint',
		type: UserResponse,
		nullable: true
	})
	author: UserResponse | null

	@Expose({ name: 'user' })
	@Type(() => UserResponse)
	@ApiProperty({
		description: 'The user against whom the complaint was filed',
		type: UserResponse,
		nullable: true
	})
	user: UserResponse | null

	@Expose({ name: 'document' })
	@Type(() => DocumentResponse)
	@ApiProperty({
		description: 'The document against which the complaint is filed',
		type: DocumentResponse,
		nullable: true
	})
	document: DocumentResponse | null

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Date of creation of the complaint',
		example: '2023-01-01T00:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'updatedAt' })
	@ApiProperty({
		description: 'Date the complaint was last updated',
		example: '2023-01-02T00:00:00Z',
		type: Date
	})
	updatedAt: Date
}

export class GetAllComplaintsResponse {
	@Expose({ name: 'page' })
	@Type(() => Complaint)
	@ApiProperty({ description: 'Complaints page', type: [Complaint] })
	page: Complaint[]

	@Expose({ name: 'total' })
	@ApiProperty({ description: 'Total number of complaints', example: 42, type: Number })
	total: number
}
