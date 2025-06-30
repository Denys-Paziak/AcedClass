import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class PendingApprovalsResponse {
	@Expose({ name: 'count' })
	@ApiProperty({
		description: 'Number of documents pending approval',
		example: 5,
		type: Number
	})
	count: number
}
