import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { EComplaintStatus } from "src/interfaces/EComplaintStatus";

export class ChangeStatusComplaintDto {
    @IsEnum(EComplaintStatus)
    @ApiProperty({
        description: 'New status of the complaint',
        example: EComplaintStatus.RESOLVED,
        enum: EComplaintStatus
    })
    status: EComplaintStatus
}