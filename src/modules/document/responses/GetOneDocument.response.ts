import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { DocumentResponse } from 'src/responses/Document.response'
import { UserResponse } from 'src/responses/User.response'

export class GetOneDocumentReponse extends DocumentResponse {
	@ApiProperty({ description: 'Користувач що загрузив документ', type: UserResponse })
	@Expose({ name: 'user' })
	@Type(() => UserResponse)
	user: UserResponse
}
