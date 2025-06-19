import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class UniversityResponse {
	@ApiProperty({ description: 'ID університету', example: 3, type: Number })
	@Expose({ name: 'id' })
	id: number

	@ApiProperty({ description: 'Назва університету', example: 'Stanford University', type: String })
	@Expose({ name: 'name' })
	name: string
}
