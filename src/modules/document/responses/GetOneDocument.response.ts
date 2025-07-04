import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { DocumentResponse } from '../../../responses/Document.response'
import { UserResponse } from '../../../responses/User.response'

export class GetOneDocumentReponse extends DocumentResponse {
	@ApiProperty({ description: 'User who uploaded the document', type: UserResponse })
	@Expose({ name: 'user' })
	@Type(() => UserResponse)
	user: UserResponse
}
