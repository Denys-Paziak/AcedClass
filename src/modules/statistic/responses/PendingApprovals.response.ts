import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class PendingApprovalsResponse {
	@Expose({ name: 'count' })
	@ApiProperty({
		description: 'Кількість документів, що очікують на затвердження',
		example: 5,
		type: Number
	})
	count: number
}
