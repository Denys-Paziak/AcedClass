import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsDate, IsString, IsInt, Min, IsEnum } from "class-validator"
import { EComplaintStatus } from "src/interfaces/EComplaintStatus"

export class GetAllComplaintsQueryDto {
	@IsOptional()
	@IsEnum(EComplaintStatus, { message: 'Invalid complaint status.' })
	@ApiProperty({
		description: 'Статус скарги',
		example: EComplaintStatus.PENDING,
		enum: EComplaintStatus,
		required: false
	})
    status?: EComplaintStatus

	@IsOptional()
    @IsEnum(['document', 'user'], {
		message: 'Type must be one of the following values: document, user'
	})
	@ApiProperty({
		description: 'Тип скарги',
		example: 'document',
		enum: ['document', 'user'],
		required: false
	})
    type?: 'document' | 'user'

	@IsOptional()
	@Type(() => Date)
	@IsDate({ message: 'Start date must be a valid date' })
	@ApiProperty({
		description: 'Початкова дата для фільтрації скарг',
		example: '2023-01-01T00:00:00Z',
		type: Date,
		required: false
	})
	startDate?: Date

    @IsOptional()
	@Type(() => Date)
	@IsDate({ message: 'End date must be a valid date' })
	@ApiProperty({
		description: 'Кінцева дата для фільтрації скарг',
		example: '2023-12-31T23:59:59Z',
		type: Date,
		required: false
	})
	endDate?: Date

	@IsOptional()
	@IsString({ message: 'Search string must be a string' })
	@ApiProperty({
		description: 'Пошуковий запит для фільтрації скарг',
		example: 'example search',
		type: String,
		required: false
	})
	search?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Limit must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Кількість скарг на сторінці',
		example: 10,
		type: Number,
		required: false,
		minimum: 0
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'Page must be an integer' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'Номер сторінки для пагінації',
		example: 1,
		type: Number,
		required: false,
		minimum: 0
	})
	page?: number
}
