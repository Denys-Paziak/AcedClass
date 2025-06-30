import { ApiProperty } from '@nestjs/swagger'

export class AllowedFileExtensionsResponse {
  @ApiProperty({ type: String, description: 'File MIME type', example: 'application/pdf' })
  mime: string

  @ApiProperty({ type: Number, description: 'Maximum file size in megabytes', example: 40 })
  maxSizeMb: number

  @ApiProperty({ type: Boolean, description: 'Whether this extension is allowed', example: true })
  allowed: boolean
}
