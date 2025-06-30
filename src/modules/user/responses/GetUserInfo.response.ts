import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { ERegistrationTypes } from 'src/interfaces/ERegistrationTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { UserResponse } from 'src/responses/User.response'

class SimpleDocument {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique document identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'Document name',
		example: 'Example Document',
		type: String
	})
	name: string
}

class SimpleUser {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique user identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'username' })
	@ApiProperty({
		description: "User's username",
		example: 'john_doe',
		type: String
	})
	username: string
}

class Document {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique document identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'Document name',
		example: 'Example Document',
		type: String
	})
	name: string

	@Expose({ name: 'status' })
	@ApiProperty({
		description: 'Document status',
		example: EDocumentStatuses.APPROVED,
		enum: EDocumentStatuses,
		type: String
	})
	status: EDocumentStatuses

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Document creation date',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'upvotesCount' })
	@ApiProperty({
		description: 'Number of upvotes',
		example: 10,
		type: Number
	})
	upvotesCount: number

	@Expose({ name: 'downvotesCount' })
	@ApiProperty({
		description: 'Number of downvotes',
		example: 10,
		type: Number
	})
	downvotesCount: number
}

class UnlockedDocument {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique identifier of the unlocked document',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'document' })
	@Type(() => SimpleDocument)
	@ApiProperty({
		description: 'Document that was unlocked',
		type: SimpleDocument
	})
	document: SimpleDocument

	@Expose({ name: 'user' })
	@Type(() => SimpleUser)
	@ApiProperty({
		description: 'User who unlocked the document',
		type: SimpleUser
	})
	user: SimpleUser

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Date when the document was unlocked',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date
}

export class GetUserInfoResponse extends UserResponse {
	@Expose({ name: 'role' })
	@ApiProperty({
		description: "User's role",
		example: ERoleNames.USER,
		enum: ERoleNames,
		type: String
	})
	role: ERoleNames

	@Expose({ name: 'registrationType' })
	@ApiProperty({
		description: "User's registration type",
		example: ERegistrationTypes.PASSWORD,
		enum: ERegistrationTypes,
		type: String
	})
	registrationType: ERegistrationTypes

	@Expose({ name: 'dailyLimitUploads' })
	@ApiProperty({
		description: "User's daily upload limit",
		example: 10,
		type: Number
	})
	dailyLimitUploads: number

	@Expose({ name: 'availableUploads' })
	@ApiProperty({
		description: "User's available uploads",
		example: 5,
		type: Number
	})
	availableUploads: number

	@Expose({ name: 'accountBlocking' })
	@ApiProperty({
		description: "Date until which the user's account is blocked",
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	accountBlocking: Date | null

	@Expose({ name: 'reasonBlocking' })
	@ApiProperty({
		description: "Reason for blocking the user's account",
		example: 'Violation of service usage rules.',
		type: String,
		required: false,
		nullable: true
	})
	reasonBlocking: string | null

	@Expose({ name: 'uploadBlocking' })
	@ApiProperty({
		description: "Date until which the user's ability to upload documents is blocked",
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	uploadBlocking: Date | null

	@Expose({ name: 'strikeCounter' })
	@ApiProperty({
		description: "User's strike points count",
		example: 2,
		type: Number,
		nullable: true
	})
	strikeCounter: number | null

	@Expose({ name: 'emailNotifications' })
	@ApiProperty({
		description: "Indicates whether the user wants to receive email notifications",
		example: true,
		type: Boolean
	})
	emailNotifications: boolean

	@Expose({ name: 'documentApprovalAlerts' })
	@ApiProperty({
		description: "Indicates whether the user wants to receive notifications about document approvals",
		example: true,
		type: Boolean
	})
	documentApprovalAlerts: boolean

	@Expose({ name: 'documents' })
	@Type(() => Document)
	@ApiProperty({
		description: "List of user's documents",
		type: [Document]
	})
	documents: Document[]

	@Expose({ name: 'unlockedDocuments' })
	@Type(() => UnlockedDocument)
	@ApiProperty({
		description: "List of user's unlocked documents",
		type: [UnlockedDocument]
	})
	unlockedDocuments: UnlockedDocument[]
}
