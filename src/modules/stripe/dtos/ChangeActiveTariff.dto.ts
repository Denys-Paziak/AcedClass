import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ChangeActiveTariffDto {
    @ApiProperty({
        description: 'Subscription plan status',
        example: false,
        type: Boolean
    })
    @IsBoolean()
    status: boolean
}
