import { ApiProperty } from '@nestjs/swagger'

export class NotificationSettingsResponse {
  @ApiProperty({
    type: Number,
    description: 'Threshold at which an admin notification is sent',
    example: 10,
  })
  adminAlertThreshold: number

  @ApiProperty({
    type: Number,
    description: 'For example, with a value of "5", notifications are sent after every 5 events after reaching the threshold',
    example: 5,
  })
  adminAlertInterval: number

  @ApiProperty({
    type: [String],
    description: 'List of administrator email addresses that receive notifications',
    example: ['admin@example.com', 'support@example.com'],
  })
  adminNotificationRecipients: string[]
}
