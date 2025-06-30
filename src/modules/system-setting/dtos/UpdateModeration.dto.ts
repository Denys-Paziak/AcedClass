import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator'

export class UpdateModerationDto {
	@ApiPropertyOptional({
		description: 'Whether manual moderator approval is required before publishing a document',
		example: true
	})
	@IsBoolean()
	@IsOptional()
	requireModeratorApproval?: boolean

	@ApiPropertyOptional({
		description: 'Threshold number of reports after which a document is automatically marked as flagged',
		example: 3
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	flaggedThreshold?: number

	@ApiPropertyOptional({
		description: 'Threshold number of reports after which a document is automatically rejected',
		example: 2
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	rejectedThreshold?: number
}
