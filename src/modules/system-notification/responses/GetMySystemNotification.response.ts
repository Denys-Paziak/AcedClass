import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { TSystemNotificationData } from 'src/interfaces/TSystemNotificationData'

export class GetMySystemNotificationResponse {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique system notification identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'type' })
	@ApiProperty({
		description: 'Type of system notification',
		example: ESystemNotificationTypes.ADD_POINTS,
		enum: ESystemNotificationTypes,
		type: String
	})
	type: ESystemNotificationTypes

	@Expose({ name: 'data' })
	@ApiProperty({
		description: 'System notification data',
		type: Object
	})
	data: TSystemNotificationData

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Date of creation of the system notification',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date
}
