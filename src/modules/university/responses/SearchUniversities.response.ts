import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SearchUniversitiesResponse {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Унікальний ідентифікатор університету',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'Назва університету',
		example: 'National University',
		type: String
	})
	name: string
}
