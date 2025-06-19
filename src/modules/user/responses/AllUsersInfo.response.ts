import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { ERegistrationTypes } from 'src/interfaces/ERegistrationTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'

class User {
	@Expose({ name: 'user_id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор користувача',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'user_username' })
	@ApiProperty({
		description: 'Username користувача',
		example: 'john_doe',
		type: String
	})
	username: string

	@Expose({ name: 'user_first_name' })
	@ApiProperty({
		description: "Ім'я користувача",
		example: 'John',
		type: String,
		nullable: true
	})
	firstName: string | null

	@Expose({ name: 'user_last_name' })
	@ApiProperty({
		description: 'Прізвище користувача',
		example: 'Doe',
		type: String,
		nullable: true
	})
	lastName: string | null

	@Expose({ name: 'user_email' })
	@ApiProperty({
		description: 'Електронна пошта користувача',
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@Expose({ name: 'user_phone' })
	@ApiProperty({
		description: 'Номер телефону користувача',
		example: '+380501234567',
		type: String,
		nullable: true
	})
	phone: string | null

	@Expose({ name: 'user_role' })
	@ApiProperty({
		description: 'Роль користувача',
		example: ERoleNames.USER,
		enum: ERoleNames,
		type: String
	})
	role: ERoleNames

	@Expose({ name: 'user_registration_type' })
	@ApiProperty({
		description: 'Тип реєстрації користувача',
		example: ERegistrationTypes.PASSWORD,
		enum: ERegistrationTypes,
		type: String
	})
	registrationType: ERegistrationTypes

	@Expose({ name: 'user_approval_level' })
	@ApiProperty({
		description: 'Рівень схвалення користувача',
		example: 1,
		type: Number
	})
	approvalLevel: number

	@Expose({ name: 'user_daily_limit_uploads' })
	@ApiProperty({
		description: 'Щоденний ліміт завантажень користувача',
		example: 10,
		type: Number
	})
	dailyLimitUploads: number

	@Expose({ name: 'user_available_uploads' })
	@ApiProperty({
		description: 'Доступні завантаження користувача',
		example: 5,
		type: Number
	})
	availableUploads: number

	@Expose({ name: 'user_account_blocking' })
	@ApiProperty({
		description: 'Дата до якої акаунт користувача заблоковано',
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false,
		nullable: true
	})
	accountBlocking: Date | null

	@Expose({ name: 'user_reason_blocking' })
	@ApiProperty({
		description: 'Причина блокування акаунту користувача',
		example: 'Порушення правил користування сервісом.',
		type: String,
		required: false,
		nullable: true
	})
	reasonBlocking: string | null

	@Expose({ name: 'user_upload_blocking' })
	@ApiProperty({
		description: 'Дата до якої можливість завантаження документів користувачем заблоковано',
		example: '2023-10-01T12:00:00Z',
		type: Date,
		required: false
	})
	uploadBlocking: Date | null

	@Expose({ name: 'user_strike_counter' })
	@ApiProperty({
		description: 'Кількість штрафних балів користувача',
		example: 2,
		type: Number
	})
	strikeCounter: number

	@Expose({ name: 'user_email_notifications' })
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати email-сповіщення',
		example: true,
		type: Boolean
	})
	emailNotifications: boolean

	@Expose({ name: 'user_document_approval_alerts' })
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати сповіщення про затвердження документів',
		example: true,
		type: Boolean
	})
	documentApprovalAlerts: boolean

	@Expose({ name: 'user_last_activity' })
	@ApiProperty({
		description: 'Дата останньої активності користувача',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	lastActivity: Date

	@Expose({ name: 'user_created_at' })
	@ApiProperty({
		description: 'Дата створення користувача',
		example: '2023-01-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'user_updated_at' })
	@ApiProperty({
		description: 'Дата останнього оновлення користувача',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	updatedAt: Date

	@Expose({ name: 'user_docCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: 'Кількість документів, завантажених користувачем',
		example: 15,
		type: Number
	})
	docCount: number

	@Expose({ name: 'user_pointsCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: 'Кількість points користувача',
		example: 100,
		type: Number
	})
	pointsCount: number

	@Expose({ name: 'user_revealsCount' })
	@Transform(({ value }) => Number(value))
	@ApiProperty({
		description: 'Кількість reveals користувача',
		example: 5,
		type: Number
	})
	revealsCount: number
}

export class AllUsersInfoResponse {
	@Expose({ name: 'page' })
	@Type(() => User)
	@ApiProperty({
		description: 'Сторінка користувачів',
		type: [User]
	})
	page: User[]
	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Загальна кількість користувачів на сторінці',
		example: 100,
		type: Number
	})
	total: number
}
