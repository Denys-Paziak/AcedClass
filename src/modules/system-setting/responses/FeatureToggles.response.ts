import { ApiProperty } from '@nestjs/swagger'

export class FeatureTogglesResponse {
  @ApiProperty({
    type: Boolean,
    description: 'Permission to upload documents',
    example: true,
  })
  documentUploading: boolean

  @ApiProperty({
    type: Boolean,
    description: 'Permission to reveal documents',
    example: true,
  })
  documentRevealing: boolean

  @ApiProperty({
    type: Boolean,
    description: 'Permission to use the voting system',
    example: true,
  })
  votingSystem: boolean

  @ApiProperty({
    type: Boolean,
    description: 'Permission to submit content reports',
    example: false,
  })
  contentReporting: boolean
}
