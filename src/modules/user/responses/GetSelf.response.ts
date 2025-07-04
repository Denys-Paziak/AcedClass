import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ERegistrationTypes } from '../../../interfaces/ERegistrationTypes'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { GetActiveTariffsResponse } from '../../../modules/stripe/responses/GetActiveTariffsResponse.response'

export class GetSelfResponse {
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

	@Expose({ name: 'firstName' })
	@ApiProperty({
		description: "User's first name",
		example: 'John',
		type: String,
		nullable: true
	})
	firstName: string | null

	@Expose({ name: 'lastName' })
	@ApiProperty({
		description: "User's last name",
		example: 'Doe',
		type: String,
		nullable: true
	})
	lastName: string | null

	@Expose({ name: 'email' })
	@ApiProperty({
		description: "User's email address",
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@Expose({ name: 'phone' })
	@ApiProperty({
		description: "User's phone number",
		example: '+380501234567',
		type: String,
		nullable: true
	})
	phone: string | null

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

	@Expose({ name: 'approvalLevel' })
	@ApiProperty({
		description: "User's approval level",
		example: 1,
		type: Number
	})
	approvalLevel: number

	@Expose({ name: 'dailyLimitUploads' })
	@ApiProperty({
		description: "User's daily upload limit",
		example: 10,
		type: Number
	})
	dailyLimitUploads: number

	@Expose({ name: 'bonusDailyLimitUploads' })
	@ApiProperty({
		description: "User's bonus daily upload limit",
		example: 4,
		type: Number
	})
	bonusDailyLimitUploads: number

	@Expose({ name: 'dailyCountUploads' })
	@ApiProperty({
		description: "Number of documents uploaded today",
		example: 5,
		type: Number
	})
	dailyCountUploads: number

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
		type: Number
	})
	strikeCounter: number

	@Expose({ name: 'emailNotifications' })
	@ApiProperty({
		description: 'Indicates whether the user wants to receive email notifications',
		example: true,
		type: Boolean
	})
	emailNotifications: boolean

	@Expose({ name: 'documentApprovalAlerts' })
	@ApiProperty({
		description: 'Indicates whether the user wants to receive notifications about document approvals',
		example: true,
		type: Boolean
	})
	documentApprovalAlerts: boolean

	@Expose({ name: 'lastActivity' })
	@ApiProperty({
		description: "Date of user's last activity",
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	lastActivity: Date

	@Expose({ name: 'subscription' })
	@Type(() => GetActiveTariffsResponse)
	@ApiProperty({
		description: 'User subscription',
		type: GetActiveTariffsResponse,
		nullable: true
	})
	subscription: GetActiveTariffsResponse | null

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'User creation date',
		example: '2023-01-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'updatedAt' })
	@ApiProperty({
		description: "User's last update date",
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	updatedAt: Date
}
