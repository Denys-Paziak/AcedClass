import { ApiProperty } from '@nestjs/swagger'

class RevealTarget {
	@ApiProperty({
		type: Number,
		description: 'Delay in hours',
		example: 5
	})
	delay: number

	@ApiProperty({
		type: Boolean,
		description: 'Is the rule active for this category',
		example: true
	})
	active: boolean
}

export class RevealSettingsResponse {
	@ApiProperty({
		type: Number,
		description: 'Default delay (in hours)',
		example: 3
	})
	defaultDelay: number

	@ApiProperty({
		type: RevealTarget,
		description: 'Delay settings for documents with specified university'
	})
	university: RevealTarget

	@ApiProperty({
		type: RevealTarget,
		description: 'Delay settings for documents with specified course'
	})
	course: RevealTarget
}
