import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SearchUniversitiesResponse {
	@Expose({ name: 'id' })
	@ApiProperty({
		description: 'Unique university identifier',
		example: 1,
		type: Number
	})
	id: number

	@Expose({ name: 'name' })
	@ApiProperty({
		description: 'University name',
		example: 'National University',
		type: String
	})
	name: string
}
