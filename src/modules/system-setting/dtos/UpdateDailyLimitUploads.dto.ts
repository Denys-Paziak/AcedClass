import { IsInt, IsOptional, Min } from "class-validator";

export class UpdateDailyLimitUploadsDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    limit?: number;
}