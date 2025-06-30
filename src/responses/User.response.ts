import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class UserResponse {
	@ApiProperty({ description: 'User ID', example: 12, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'User username', example: 'john_doe', type: String })
	@Expose({ name: 'username' })
	username: string

	@ApiProperty({ description: 'User first name', example: 'John', nullable: true, type: String })
	@Expose({ name: 'firstName' })
	firstName: string | null

	@ApiProperty({ description: 'User last name', example: 'Doe', nullable: true, type: String })
	@Expose({ name: 'lastName' })
	lastName: string | null

	@ApiProperty({ description: 'User email', example: 'john@example.com', type: String })
	@Expose({ name: 'email' })
	email: string

	@ApiProperty({ description: 'User phone number', example: '+380123456789', nullable: true, type: String })
	@Expose({ name: 'phone' })
	phone: string | null

	@ApiProperty({ description: 'User approval level', example: 70, type: Number })
	@Expose({ name: 'approvalLevel' })
	approvalLevel: number

	@ApiProperty({ description: 'User last activity date', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'lastActivity' })
	lastActivity: Date

	@ApiProperty({ description: 'User creation date', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'createdAt' })
	createdAt: Date
}
