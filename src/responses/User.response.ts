import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class UserResponse {
	@ApiProperty({ description: 'ID користувача', example: 12, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Username користувача', example: 'john_doe', type: String })
	@Expose({ name: 'username' })
	username: string

	@ApiProperty({ description: 'Імʼя користувача', example: 'John', nullable: true, type: String })
	@Expose({ name: 'firstName' })
	firstName: string | null

	@ApiProperty({ description: 'Прізвище користувача', example: 'Doe', nullable: true, type: String })
	@Expose({ name: 'lastName' })
	lastName: string | null

	@ApiProperty({ description: 'Email користувача', example: 'john@example.com', type: String })
	@Expose({ name: 'email' })
	email: string

	@ApiProperty({ description: 'Телефон користувача', example: '+380123456789', nullable: true, type: String })
	@Expose({ name: 'phone' })
	phone: string | null

	@ApiProperty({ description: 'Рівень схвалення користувача', example: 70, type: Number })
	@Expose({ name: 'approvalLevel' })
	approvalLevel: number

	@ApiProperty({ description: 'Дата останньої активності користувача', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'lastActivity' })
	lastActivity: Date

	@ApiProperty({ description: 'Дата створення користувача', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
