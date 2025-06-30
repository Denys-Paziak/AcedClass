import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { ERegistrationTypes } from 'src/interfaces/ERegistrationTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'

class User {
	@Expose({ name: 'user_id' })
	@ApiProperty({
		description: 'Unique user identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'user_username' })
	@ApiProperty({
		description: "User's username",
		example: 'john_doe',
		type: String
	})
	username: string

	@Expose({ name: 'user_first_name' })
	@ApiProperty({
		description: "User's first name",
		example: 'John',
		type: String,
		nullable: true
	})
	firstName: string | null

	@Expose({ name: 'user_last_name' })
	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
		type: String,
		nullable: true
	})
	lastName: string | null

	@Expose({ name: 'user_email' })
	@ApiProperty({
		description: "User's email address",
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@Expose({ name: 'user_phone' })
	@ApiProperty({
		description: "User's phone number",
		example: '+380501234567',
		type: String,
		nullable: true
	})
	phone: string | null

	@Expose({ name: 'user_role' })
	@ApiProperty({
		description: "User's role",
		example: ERoleNames.USER,
		enum: ERoleNames,
		type: String
	})
	role: ERoleNames

	@Expose({ name: 'user_registration_type' })
	@ApiProperty({
		description: "User's registration type",
		example: ERegistrationTypes.PASSWORD,
		enum: ERegistrationTypes,
		type: String
	})
	registrationType: ERegistrationTypes

	@Expose({ name: 'user_approval_level' })
	@ApiProperty({
		description: "User's approval level",
		example: 1,
		type: Number
	})
	approvalLevel: number

	@Expose({ name: 'user_daily_limit_uploads' })
	@ApiProperty({
		description: "User's daily upload limit",
		example: 10,
		type: Number
	})
	dailyLimitUploads: number

	@Expose({ name: 'user_available_uploads' })
	@ApiProperty({
		description: "User's available uploads",
		example: 5,
		type: Number
	})
	availableUploads: number

	@Expose({ name: 'user_account_blocking' })
	@ApiProperty({
		description: "Date until which the user's account is blocked",
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	accountBlocking: Date | null

	@Expose({ name: 'user_reason_blocking' })
	@ApiProperty({
		description: "Reason for blocking the user's account",
		example: 'Violation of service usage rules.',
		type: String,
		required: false,
		nullable: true
	})
	reasonBlocking: string | null

	@Expose({ name: 'user_upload_blocking' })
	@ApiProperty({
		description: "Date until which the user's ability to upload documents is blocked",
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	uploadBlocking: Date | null

	@Expose({ name: 'user_strike_counter' })
	@ApiProperty({
		description: "User's strike points count",
		example: 2,
		type: Number
	})
	strikeCounter: number

	@Expose({ name: 'user_email_notifications' })
	@ApiProperty({
		description: "Indicates whether the user wants to receive email notifications",
		example: true,
		type: Boolean
	})
	emailNotifications: boolean

	@Expose({ name: 'user_document_approval_alerts' })
	@ApiProperty({
		description: "Indicates whether the user wants to receive notifications about document approvals",
		example: true,
		type: Boolean
	})
	documentApprovalAlerts: boolean

	@Expose({ name: 'user_last_activity' })
	@ApiProperty({
		description: "Date of user's last activity",
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	lastActivity: Date

	@Expose({ name: 'user_created_at' })
	@ApiProperty({
		description: "User creation date",
		example: '2023-01-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'user_updated_at' })
	@ApiProperty({
		description: "User's last update date",
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	updatedAt: Date

	@Expose({ name: 'user_docCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: "Number of documents uploaded by the user",
		example: 15,
		type: Number
	})
	docCount: number

	@Expose({ name: 'user_pointsCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: "User's points count",
		example: 100,
		type: Number
	})
	pointsCount: number

	@Expose({ name: 'user_revealsCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: "User's reveals count",
		example: 5,
		type: Number
	})
	revealsCount: number
}

export class AllUsersInfoResponse {
	@Expose({ name: 'page' })
	@Type(() => User)
	@ApiProperty({
		description: 'Page of users',
		type: [User]
	})
	page: User[]

	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Total number of users in the page',
		example: 100,
		type: Number
	})
	total: number
}
