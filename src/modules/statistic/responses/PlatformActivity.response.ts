import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

class Values {
	@Expose({ name: 'total' })
	@ApiProperty({
		description: 'Total count for the specified period',
		type: Number
	})
	total: number

	@Expose({ name: 'growth' })
	@ApiProperty({
		description: 'Growth compared to the previous period',
		type: Number
	})
	growth: number

	@Expose({ name: 'growthPercent' })
	@ApiProperty({
		description: 'Percentage growth compared to the previous period',
		type: Number
	})
	growthPercent: number
}

export class PlatformActivityResponse {
	@Expose({ name: 'users' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Number of new users',
		type: Values
	})
	users: Values

	@Expose({ name: 'uploaded' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Number of uploaded documents',
		type: Values
	})
	uploaded: Values

	@Expose({ name: 'revealed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Number of unlocked documents',
		type: Values
	})
	revealed: Values

	@Expose({ name: 'pointsUsed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Number of points used',
		type: Values
	})
	pointsUsed: Values

	@Expose({ name: 'revealsUsed' })
	@Type(() => Values)
	@ApiProperty({
		description: 'Number of reveals used',
		type: Values
	})
	revealsUsed: Values
}
