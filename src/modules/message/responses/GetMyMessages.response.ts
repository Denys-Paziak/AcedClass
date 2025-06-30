import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class GetMyMessagesResponse {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique message identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'subject' })
	@ApiProperty({
		description: 'Message subject',
		example: 'Inquiry about the document',
		type: String
	})
	subject: string

	@Expose({ name: 'message' })
	@ApiProperty({
		description: 'Message body text',
		example: 'Hello, I have a question regarding this document.',
		type: String
	})
	message: string

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Date and time when the message was created',
		example: '2023-10-01T12:00:00Z',
		type: String
	})
	createdAt: Date

	@Expose({ name: 'updatedAt' })
	@ApiProperty({
		description: 'Date and time when the message was last updated',
		example: '2023-10-01T12:00:00Z',
		type: String
	})
	updatedAt: Date
}
