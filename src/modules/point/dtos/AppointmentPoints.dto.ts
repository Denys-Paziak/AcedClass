import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

export class AppointmentPointsDto {
	@IsInt({ message: 'User ID must be an integer.' })
	@Min(0, { message: 'The value cannot be less than zero.' })
	@ApiProperty({
		description: 'ID користувача, якому нараховуються бали',
		example: 123,
		type: Number
	})
	userId: number

	@IsInt({ message: 'Ammount must be an integer.' })
	@ApiProperty({
		description: 'Кількість балів, які нарахуються або спишуться з балансу користувача',
		example: 50,
		type: Number
	})
	ammount: number
}
