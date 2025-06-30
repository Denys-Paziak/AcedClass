import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

class User {
	@ApiProperty({ description: 'User ID', example: 12, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'User username', example: 'john_doe', type: String })
	@Expose({ name: 'username' })
	username: string

	@ApiProperty({ description: 'Number of uploaded documents', example: 34, type: Number })
	@Expose({ name: 'docCount' })
	docCount: number

	@ApiProperty({ description: 'Total number of Points earned', example: 98, type: Number })
	@Expose({ name: 'totalEarnedSum' })
	totalEarnedSum: number

	@ApiProperty({ description: 'Number of Points used', example: 67, type: Number })
	@Expose({ name: 'usedSum' })
	usedSum: number

	@ApiProperty({ description: 'Date of user last activity', example: '2024-04-22T09:00:00Z', type: Date })
	@Expose({ name: 'lastActivity' })
	lastActivity: Date
}

export class TopUsersResponse {
	@Expose({ name: 'page' })
	@Type(() => User)
	@ApiProperty({
		description: 'List of top performing users',
		type: [User]
	})
	page: User[]

	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Total number of users',
		type: Number,
		example: 1000
	})
	total: number
}
