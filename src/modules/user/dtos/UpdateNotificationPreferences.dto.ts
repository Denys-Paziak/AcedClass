import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateNotificationPreferencesDto {
	@IsBoolean({ message: 'emailNotifications must be a boolean value.' })
	@IsOptional()
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати email-сповіщення',
		example: true,
		type: Boolean,
		required: false
	})
	emailNotifications: boolean

	@IsBoolean({ message: 'documentApprovalAlerts must be a boolean value.' })
	@IsOptional()
	@ApiProperty({
		description: 'Вказує, чи користувач хоче отримувати сповіщення про затвердження документів',
		example: true,
		type: Boolean,
		required: false
	})
	documentApprovalAlerts: boolean
}
