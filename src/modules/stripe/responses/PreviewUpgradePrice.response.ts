import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

export class PreviewUpgradePriceResponse {
	@ApiProperty({ description: 'Amount', example: 70, type: Number })
	@Expose({ name: 'amount' })
	amount: number
	@ApiProperty({ description: 'Currency', example: "usd", type: String })
	@Expose({ name: 'currency' })
	currency: string
}
