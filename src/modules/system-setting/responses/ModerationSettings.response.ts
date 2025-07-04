import { ApiProperty } from '@nestjs/swagger'

export class ModerationSettingsResponse {
  @ApiProperty({
    type: Boolean,
    description: 'Whether moderator approval is required for the document',
    example: true,
  })
  requaireModeratorApproval: boolean

  @ApiProperty({
    type: Number,
    description: 'Number of reports after which the document is flagged as suspicious',
    example: 5,
  })
  flaggedThreshold: number

  @ApiProperty({
    type: Number,
    description: 'Number of rejections after which the document is hidden',
    example: 3,
  })
  rejectedThreshold: number
}
