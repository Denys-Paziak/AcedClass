import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'

export class TopUsersQueryDto {
	@IsEnum([1, 7, 30, 90], {
		message: 'Range days must be one of the following values: 1, 7, 30, or 90.'
	})
	@Type(() => Number)
	@ApiProperty({
		description: 'Кількість днів для аналізу активності платформи',
		example: 30,
		enum: [1, 7, 30, 90],
		type: Number
	})
	rangeDays: 1 | 7 | 30 | 90

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Кількість користувачів, які будуть повернуті в результатах',
		example: 10,
		type: Number,
		required: false
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Page must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Номер сторінки для пагінації результатів',
		example: 1,
		type: Number,
		required: false
	})
	page?: number
}
