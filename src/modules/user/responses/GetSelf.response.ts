import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ERegistrationTypes } from 'src/interfaces/ERegistrationTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'

export class GetSelfResponse {
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

	@Expose({ name: 'firstName' })
	@ApiProperty({
		description: "Ім'я користувача",
		example: 'John',
		type: String,
		nullable: true
	})
	firstName: string | null

	@Expose({ name: 'lastName' })
	@ApiProperty({
		description: 'Прізвище користувача',
		example: 'Doe',
		type: String,
		nullable: true
	})
	lastName: string | null

	@Expose({ name: 'email' })
	@ApiProperty({
		description: 'Електронна пошта користувача',
		example: 'user@example.com',
		type: String,
		format: 'email'
	})
	email: string

	@Expose({ name: 'phone' })
	@ApiProperty({
		description: 'Номер телефону користувача',
		example: '+380501234567',
		type: String,
		nullable: true
	})
	phone: string | null

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

	@Expose({ name: 'approvalLevel' })
	@ApiProperty({
		description: 'Рівень схвалення користувача',
		example: 1,
		type: Number
	})
	approvalLevel: number

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
		required: false,
		nullable: true
	})
	uploadBlocking: Date | null

	@Expose({ name: 'strikeCounter' })
	@ApiProperty({
		description: 'Кількість штрафних балів користувача',
		example: 2,
		type: Number
	})
	strikeCounter: number

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

	@Expose({ name: 'lastActivity' })
	@ApiProperty({
		description: 'Дата останньої активності користувача',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	lastActivity: Date

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Дата створення користувача',
		example: '2023-01-01T12:00:00Z',
		type: Date
	})
	createdAt: Date

	@Expose({ name: 'updatedAt' })
	@ApiProperty({
		description: 'Дата останнього оновлення користувача',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	updatedAt: Date
}
