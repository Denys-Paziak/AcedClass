import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetMyPointsResponse {
    @Expose({ name: 'points' })
    @ApiProperty({
        description: 'Кількість балів користувача',
        example: 150,
        type: Number
    })
    points: number
}