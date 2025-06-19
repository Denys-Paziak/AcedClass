import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

class User {
	@Expose({ name: 'id' })
	id: number

	@Expose({ name: 'username' })
	username: string

	@Expose({ name: 'docCount' })
	docCount: number

	@Expose({ name: 'totalEarnedSum' })
	totalEarnedSum: number

	@Expose({ name: 'usedSum' })
	usedSum: number

	@Expose({ name: 'lastActivity' })
	lastActivity: Date
}

export class TopUsersResponse {
	@Expose({ name: 'page' })
	@Type(() => User)
	@ApiProperty({
		description: 'Список користувачів з найвищими показниками',
		type: [User]
	})
	page: User[]

	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Загальна кількість користувачів',
		type: Number,
		example: 1000
	})
	total: number
}
