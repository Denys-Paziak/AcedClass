import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EPointTypes } from 'src/interfaces/EPointTypes'

class User {
	@ApiProperty({ description: 'User ID', example: 12, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Username', example: 'john_doe', type: String })
	@Expose({ name: 'username' })
	username: string

	@ApiProperty({ description: 'User email', example: 'john@example.com', type: String })
	@Expose({ name: 'email' })
	email: string
}

class Author {
	@ApiProperty({ description: 'Author ID', example: 7, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Author username', example: 'jane_doe', type: String })
	@Expose({ name: 'username' })
	username: string
}

class Document {
	@ApiProperty({ description: 'Document ID', example: 5, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Document name', example: 'Intro_to_Math.pdf', type: String })
	@Expose({ name: 'name' })
	name: string

	@ApiProperty({ description: 'Document author', type: Author })
	@Expose({ name: 'user' })
	@Type(() => Author)
	user: Author
}

class Unlock {
	@ApiProperty({ description: 'Unlock ID', example: 101, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ enum: EPointTypes, description: 'Type of currency used', example: EPointTypes.POINT })
	@Expose({ name: 'pointType' })
	pointType: EPointTypes

	@ApiProperty({ description: 'User who unlocked the document', type: User })
	@Expose({ name: 'user' })
	@Type(() => User)
	user: User

	@ApiProperty({ description: 'Unlocked document', type: Document })
	@Expose({ name: 'document' })
	@Type(() => Document)
	document: Document

	@ApiProperty({ description: 'Date of unlock', example: '2024-06-15T10:30:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}

export class GetAllUnlocksResponse {
	@ApiProperty({
		description: 'Page of unlocked documents',
		type: [Unlock]
	})
	@Expose({ name: 'page' })
	@Type(() => Unlock)
	page: Unlock[]

	@ApiProperty({
		description: 'Total number of unlocks',
		type: Number,
		example: 15
	})
	@Expose({ name: 'total' })
	total: number
}
