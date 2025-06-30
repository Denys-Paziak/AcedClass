import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PlanIdParamDto {
	@ApiProperty({
		description: 'Subscription plan ID',
		example: 'price_1O84DsLuzkSaEhZWx...',
		type: String
	})
	@IsString()
	planId: string
}
