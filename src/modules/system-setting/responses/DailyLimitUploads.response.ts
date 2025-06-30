import { ApiProperty } from '@nestjs/swagger'

export class DailyLimitUploadsResponse {
  @ApiProperty({
    type: Number,
    description: 'Maximum number of document uploads per day',
    example: 10,
  })
  limit: number

  @ApiProperty({
    type: Boolean,
    description: 'Whether the upload limit is active',
    example: true,
  })
  active: boolean
}
