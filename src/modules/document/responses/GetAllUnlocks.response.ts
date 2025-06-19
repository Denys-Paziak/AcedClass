import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EPointTypes } from 'src/interfaces/EPointTypes'

class User {
	@ApiProperty({ description: 'ID користувача', example: 12, type: Number })
	@Expose({ name: 'id' })
	id: number
	@ApiProperty({ description: 'Імʼя користувача', example: 'john_doe', type: String })
	@Expose({ name: 'username' })
	username: string
	@ApiProperty({ description: 'Email користувача', example: 'john@example.com', type: String })
	@Expose({ name: 'email' })
	email: string
}

class Author {
	@ApiProperty({ description: 'ID автора', example: 7, type: Number })
	@Expose({ name: 'id' })
	id: number
	@ApiProperty({ description: 'Імʼя автора', example: 'jane_doe', type: String })
	@Expose({ name: 'username' })
	username: string
}

class Document {
	@ApiProperty({ description: 'ID документа', example: 5, type: Number })
	@Expose({ name: 'id' })
	id: number
	@ApiProperty({ description: 'Назва документа', example: 'Intro_to_Math.pdf', type: String })
	@Expose({ name: 'name' })
	name: string
	@ApiProperty({ description: 'Автор документа', type: Author })
	@Expose({ name: 'user' })
	@Type(() => Author)
	user: Author
}

class Unlock {
	@ApiProperty({ description: 'ID розблокування', example: 101, type: Number })
	@Expose({ name: 'id' })
	id: number
	@ApiProperty({ enum: EPointTypes, description: 'Тип валюти', example: EPointTypes.POINT })
	@Expose({ name: 'pointType' })
	pointType: EPointTypes
	@ApiProperty({ description: 'Користувач, який розблокував', type: User })
	@Expose({ name: 'user' })
	@Type(() => User)
	user: User
	@ApiProperty({ description: 'Документ, який було розблоковано', type: Document })
	@Expose({ name: 'document' })
	@Type(() => Document)
	document: Document
	@ApiProperty({ description: 'Дата створення', example: '2024-06-15T10:30:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}

export class GetAllUnlocksResponse {
	@ApiProperty({
		description: 'Сторінка з розблокуваннями документів',
		type: [Unlock]
	})
	@Expose({ name: 'page' })
	@Type(() => Unlock)
	page: Unlock[]

	@ApiProperty({
		description: 'Загальна кількість розблокувань',
		type: Number,
		example: 15
	})
	@Expose({ name: 'total' })
	total: number
}
