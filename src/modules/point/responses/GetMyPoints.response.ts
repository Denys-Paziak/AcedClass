import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetMyPointsResponse {
    @Expose({ name: 'points' })
    @ApiProperty({
        description: 'The number of user points',
        example: 150,
        type: Number
    })
    points: number
}