import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { EComplaintFlags } from '../../../interfaces/EComplaintFlags'

export class PostComplaintDto {
	@IsEnum(EComplaintFlags)
	@ApiProperty({
		description: 'Complaint flags',
		example: EComplaintFlags.COPYRIGHT_VIOLATION,
		enum: EComplaintFlags,
		required: true
	})
	flag: EComplaintFlags

	@IsString()
	@MinLength(50)
	@MaxLength(1000)
	@ApiProperty({
		description: 'Text of the complaint',
		example: 'This document violates copyright',
		minLength: 50,
		maxLength: 1000,
		type: String,
		required: true
	})
	message: string

	@IsOptional()
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'ID of the user filing the complaint',
		example: 123,
		type: Number,
		required: false
	})
	userId?: number

	@IsOptional()
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'ID of the document against which the complaint is filed',
		example: 456,
		type: Number,
		required: false
	})
	documentId?: number
}
