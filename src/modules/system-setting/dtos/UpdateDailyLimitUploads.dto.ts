import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, Min } from 'class-validator'

export class UpdateDailyLimitUploadsDto {
	@ApiProperty({
		description: 'Basic daily limit for uploading documents',
		example: 8
	})
	@IsInt()
	@Min(0)
	limit: number

	@ApiProperty({
		description: 'Whether the document upload limit is active',
		example: true
	})
	@IsBoolean()
	active: boolean
}
