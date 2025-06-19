import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

class Values {
	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Загальна кількість за вказаний період',
		type: Number
	})
	total: number

	@Expose({ name: 'growth' })
	@ApiProperty({
		description: 'Зростання в порівнянні з попереднім періодом',
		type: Number
	})
	growth: number

	@Expose({ name: 'growthPercent' })
	@ApiProperty({
		description: 'Відсоток зростання в порівнянні з попереднім періодом',
		type: Number
	})
	growthPercent: number
}

export class PlatformActivityResponse {
	@Expose({ name: 'users' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Кількість нових користувачів',
		type: Values
	})
	users: Values

	@Expose({ name: 'uploaded' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Кількість завантажених документів',
		type: Values
	})
	uploaded: Values

	@Expose({ name: 'revealed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Кількість розблокованих документів',
		type: Values
	})
	revealed: Values

	@Expose({ name: 'pointsUsed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Кількість використаних Point',
		type: Values
	})
	pointsUsed: Values

	@Expose({ name: 'revealsUsed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Кількість використаних Reveal',
		type: Values
	})
	revealsUsed: Values
}
