import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'

export class ChangeStatusDocumentDto {
	@ApiProperty({
		description: 'Новий статус документа',
		enum: EDocumentStatuses,
		example: EDocumentStatuses.APPROVED
	})
	@IsEnum(EDocumentStatuses, { message: 'Invalid document status.' })
	status: EDocumentStatuses
}
