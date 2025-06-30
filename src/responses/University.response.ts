import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class UniversityResponse {
	@ApiProperty({ description: 'University ID', example: 3, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'University name', example: 'Stanford University', type: String })
	@Expose({ name: 'name' })
	name: string
}
