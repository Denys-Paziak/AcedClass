import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class AppointmentPointsDto {
	@IsInt()
	@Min(0)
	@ApiProperty({
		description: 'ID of the user to whom points are awarded',
		example: 123,
		type: Number
	})
	userId: number

	@IsInt()
	@ApiProperty({
		description: "The number of points that will be credited or deducted from the user's balance",
		example: 50,
		type: Number
	})
	ammount: number
}
