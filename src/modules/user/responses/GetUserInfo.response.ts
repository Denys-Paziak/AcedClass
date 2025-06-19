import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { ERegistrationTypes } from 'src/interfaces/ERegistrationTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { UserResponse } from 'src/responses/User.response'

class SimpleDocument {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор документа',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'Назва документа',
		example: 'Example Document',
		type: String
	})
	name: string
}

class SimpleUser {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор користувача',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'username' })
	@ApiProperty({
		description: 'Username користувача',
		example: 'john_doe',
		type: String
	})
	username: string
}

class Document {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор документа',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'Назва документа',
		example: 'Example Document',
		type: String
	})
	name: string

	@Expose({ name: 'status' })
	@ApiProperty({
		description: 'Статус документа',
		example: EDocumentStatuses.APPROVED,
		enum: EDocumentStatuses,
		type: String
	})
	status: EDocumentStatuses

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Дата створення документа',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'upvotesCount' })
	@ApiProperty({
		description: 'Кількість дізлайків',
		example: 10,
		type: Number
	})
	upvotesCount: number

	@Expose({ name: 'downvotesCount' })
	@ApiProperty({
		description: 'Кількість лайків',
		example: 10,
		type: Number
	})
	downvotesCount: number
}

class UnlockedDocument {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор розблокованого документа',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'document' })
	@Type(() => SimpleDocument)
	@ApiProperty({
		description: 'Документ, який був розблокований',
		type: SimpleDocument
	})
	document: SimpleDocument

	@Expose({ name: 'user' })
	@Type(() => SimpleUser)
	@ApiProperty({
		description: 'Користувач, який розблокував документ',
		type: SimpleUser
	})
	user: SimpleUser

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Дата розблокування документа',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date
}

export class GetUserInfoResponse extends UserResponse {
	@Expose({ name: 'role' })
	@ApiProperty({
		description: 'Роль користувача',
		example: ERoleNames.USER,
		enum: ERoleNames,
		type: String
	})
	role: ERoleNames

	@Expose({ name: 'registrationType' })
	@ApiProperty({
		description: 'Тип реєстрації користувача',
		example: ERegistrationTypes.PASSWORD,
		enum: ERegistrationTypes,
		type: String
	})
	registrationType: ERegistrationTypes

	@Expose({ name: 'dailyLimitUploads' })
	@ApiProperty({
		description: 'Щоденний ліміт завантажень користувача',
		example: 10,
		type: Number
	})
	dailyLimitUploads: number

	@Expose({ name: 'availableUploads' })
	@ApiProperty({
		description: 'Доступні завантаження користувача',
		example: 5,
		type: Number
	})
	availableUploads: number

	@Expose({ name: 'accountBlocking' })
	@ApiProperty({
		description: 'Дата до якої акаунт користувача заблоковано',
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	accountBlocking: Date | null

	@Expose({ name: 'reasonBlocking' })
	@ApiProperty({
		description: 'Причина блокування акаунту користувача',
		example: 'Порушення правил користування сервісом.',
		type: String,
		required: false,
		nullable: true
	})
	reasonBlocking: string | null

	@Expose({ name: 'uploadBlocking' })
	@ApiProperty({
		description: 'Дата до якої можливість завантаження документів користувачем заблоковано',
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false
	})
	uploadBlocking: Date | null

	@Expose({ name: 'strikeCounter' })
	@ApiProperty({
		description: 'Кількість штрафних балів користувача',
		example: 2,
		type: Number
	})
	strikeCounter: number | null

	@Expose({ name: 'emailNotifications' })
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати email-сповіщення',
		example: true,
		type: Boolean
	})
	emailNotifications: boolean

	@Expose({ name: 'documentApprovalAlerts' })
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати сповіщення про затвердження документів',
		example: true,
		type: Boolean
	})
	documentApprovalAlerts: boolean

	@Expose({ name: 'documents' })
	@Type(() => Document)
	@ApiProperty({
		description: 'Список документів користувача',
		type: [Document]
	})
	documents: Document[]

	@Expose({ name: 'unlockedDocuments' })
	@Type(() => UnlockedDocument)
	@ApiProperty({
		description: 'Список розблокованих документів користувача',
		type: [UnlockedDocument]
	})
	unlockedDocuments: UnlockedDocument[]
}
