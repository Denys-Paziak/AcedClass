import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ESystemNotificationTypes } from 'src/interfaces/ESystemNotificationTypes'
import { TSystemNotificationData } from 'src/interfaces/TSystemNotificationData'

export class GetMySystemNotificationResponse {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор системного сповіщення',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'type' })
	@ApiProperty({
		description: 'Тип системного сповіщення',
		example: ESystemNotificationTypes.ADD_POINTS,
		enum: ESystemNotificationTypes,
		type: String
	})
	type: ESystemNotificationTypes

	@Expose({ name: 'data' })
	@ApiProperty({
		description: 'Дані системного сповіщення',
		type: Object
	})
	data: TSystemNotificationData

	@Expose({ name: 'createdAt' })
	@ApiProperty({
		description: 'Дата створення системного сповіщення',
		example: '2023-10-01T12:00:00Z',
		type: Date
	})
	createdAt: Date
}
