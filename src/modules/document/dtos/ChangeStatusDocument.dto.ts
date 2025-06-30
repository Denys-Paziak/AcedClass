import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

export class ChangeStatusDocumentDto {
	@ApiProperty({
		description: 'New status of the document',
		enum: EDocumentStatuses,
		example: EDocumentStatuses.APPROVED
	})
	@IsEnum(EDocumentStatuses)
	status: EDocumentStatuses
}
