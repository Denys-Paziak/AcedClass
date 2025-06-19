import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { EComplaintStatus } from "src/interfaces/EComplaintStatus";

export class ChangeStatusComplaintDto {
    @IsEnum(EComplaintStatus, { message: 'Invalid complaint status.' })
    @ApiProperty({
        description: 'Новий статус скарги',
        example: EComplaintStatus.RESOLVED,
        enum: EComplaintStatus
    })
    status: EComplaintStatus
}