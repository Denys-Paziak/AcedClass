import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEmail, IsInt, IsOptional, IsPositive, Min } from 'class-validator'

export class UpdateNotificationDto {
	@ApiPropertyOptional({
		description: 'Threshold number of events to trigger an admin alert',
		example: 10,
		type: Number
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	adminAlertThreshold?: number

	@ApiPropertyOptional({
		description: 'For example, with a value of "5", notifications will be sent after every 5 events beyond the threshold',
		example: 5,
		type: Number
	})
	@IsInt()
	@IsPositive()
	@IsOptional()
	adminAlertInterval?: number

	@ApiPropertyOptional({
		description: 'List of email addresses to receive admin notifications',
		example: ['admin1@example.com', 'admin2@example.com'],
		type: [String]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@IsEmail({}, { each: true })
	@IsOptional()
	adminNotificationRecipients?: string[]
}
