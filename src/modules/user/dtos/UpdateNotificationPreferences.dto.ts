import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateNotificationPreferencesDto {
	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		description: 'Indicates whether the user wants to receive email notifications',
		example: true,
		type: Boolean,
		required: false
	})
	emailNotifications?: boolean

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		description: 'Indicates whether the user wants to receive notifications about document approvals',
		example: true,
		type: Boolean,
		required: false
	})
	documentApprovalAlerts?: boolean
}
