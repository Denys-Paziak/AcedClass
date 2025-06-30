import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

class Period {
    @ApiProperty({
        description: 'Type of time interval (e.g., month, year)',
        example: 'year',
        type: String
    })
    @Expose({ name: 'interval' })
    interval: string

    @ApiProperty({
        description: 'Number of units of the given interval (e.g., 2 → two years if interval = "year")',
        example: 2,
        type: Number
    })
    @Expose({ name: 'count' })
    count: number
}

export class GetAllTariffsResponse {
    @ApiProperty({
        description: 'Subscription tariff plan ID',
        example: 'price_1O84DsLuzkSaEhZWx...',
        type: String
    })
    @Expose({ name: 'id' })
    id: string

    @ApiProperty({ description: 'Price', example: 70, type: Number })
    @Expose({ name: 'price' })
    price: number

    @ApiProperty({ description: 'Currency', example: 'usd', type: String })
    @Expose({ name: 'currency' })
    currency: string

    @ApiProperty({
        description: 'Tariff period',
        type: Period
    })
    @Expose({ name: 'period' })
    @Type(() => Period)
    period: Period

    @ApiProperty({ description: 'Plan name', example: 'quarterly', type: String })
    @Expose({ name: 'name' })
    name: string

    @ApiProperty({ description: 'Number of users with this tariff plan', example: 144, type: Number })
    @Expose({ name: 'numberUsers' })
    numberUsers: number

    @ApiProperty({ description: 'Subscription plan status', example: false, type: Boolean })
    @Expose({ name: 'active' })
    active: boolean
}
