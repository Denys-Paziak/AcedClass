import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateFeatureTogglesDto {
	@ApiPropertyOptional({
		description: 'Enable or disable document uploading feature',
		example: true
	})
	@IsBoolean()
	@IsOptional()
	documentUploading?: boolean

	@ApiPropertyOptional({
		description: 'Enable or disable document unlocking feature',
		example: false
	})
	@IsBoolean()
	@IsOptional()
	documentRevealing?: boolean

	@ApiPropertyOptional({
		description: 'Enable or disable voting (rating) system',
		example: true
	})
	@IsBoolean()
	@IsOptional()
	votingSystem?: boolean

	@ApiPropertyOptional({
		description: 'Enable or disable content reporting feature',
		example: true
	})
	@IsBoolean()
	@IsOptional()
	contentReporting?: boolean
}
