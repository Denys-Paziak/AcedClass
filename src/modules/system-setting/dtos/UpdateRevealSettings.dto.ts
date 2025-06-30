import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator'

class AdditionalField {
	@ApiPropertyOptional({
		description: 'Acceleration in hours',
		example: 11.5,
		minimum: 0
	})
	@IsNumber()
	@Min(0)
	@IsOptional()
	delay?: number

	@ApiPropertyOptional({
		description: 'Whether to consider this field',
		example: true
	})
	@IsBoolean()
	@IsOptional()
	active?: boolean
}

export class UpdateRevealSettingsDto {
	@ApiPropertyOptional({
		description: 'Default delay for accrual (in hours)',
		example: 24,
		minimum: 1
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	defaultDelay?: number

	@ValidateNested()
	@Type(() => AdditionalField)
	@IsOptional()
	university?: AdditionalField

	@ValidateNested()
	@Type(() => AdditionalField)
	@IsOptional()
	course?: AdditionalField
}
