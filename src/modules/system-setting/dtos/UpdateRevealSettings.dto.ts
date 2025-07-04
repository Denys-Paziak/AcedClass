import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator'

class AdditionalField {
	@ApiPropertyOptional({
		description: 'Acceleration in hours',
		example: 11.5,
		minimum: 0,
		type: Number
	})
	@IsNumber()
	@Min(0)
	@IsOptional()
	delay?: number

	@ApiPropertyOptional({
		description: 'Whether to consider this field',
		example: true,
		type: Boolean
	})
	@IsBoolean()
	@IsOptional()
	active?: boolean
}

export class UpdateRevealSettingsDto {
	@ApiPropertyOptional({
		description: 'Default delay for accrual (in hours)',
		example: 24,
		minimum: 1,
		type: Number
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	defaultDelay?: number

	@ValidateNested()
	@Type(() => AdditionalField)
	@IsOptional()
	@ApiPropertyOptional({
		type: AdditionalField
	})
	university?: AdditionalField

	@ValidateNested()
	@Type(() => AdditionalField)
	@IsOptional()
	@ApiPropertyOptional({
		type: AdditionalField
	})
	course?: AdditionalField
}
