import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsDate, IsString, IsInt, Min, IsEnum } from "class-validator"
import { EComplaintStatus } from "../../../interfaces/EComplaintStatus"

export class GetAllComplaintsQueryDto {
	@IsOptional()
	@IsEnum(EComplaintStatus)
	@ApiProperty({
		description: 'Status of the complaint',
		example: EComplaintStatus.PENDING,
		enum: EComplaintStatus,
		required: false
	})
    status?: EComplaintStatus

	@IsOptional()
    @IsEnum(['document', 'user'])
	@ApiProperty({
		description: 'Type of complaint',
		example: 'document',
		enum: ['document', 'user'],
		required: false
	})
    type?: 'document' | 'user'

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiProperty({
		description: 'Start date for filtering complaints',
		example: '2023-01-01T00:00:00Z',
		type: Date,
		required: false
	})
	startDate?: Date

    @IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiProperty({
		description: 'Deadline for filtering complaints',
		example: '2023-12-31T23:59:59Z',
		type: Date,
		required: false
	})
	endDate?: Date

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'Search query for filtering complaints',
		example: 'example search',
		type: String,
		required: false
	})
	search?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Number of complaints per page',
		example: 10,
		type: Number,
		required: false,
		minimum: 0
	})
	limit?: number

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'Page number for pagination',
		example: 1,
		type: Number,
		required: false,
		minimum: 0
	})
	page?: number
}
