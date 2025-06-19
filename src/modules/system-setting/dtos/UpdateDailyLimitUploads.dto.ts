import { IsInt, IsOptional, Min } from "class-validator";

export class UpdateDailyLimitUploadsDto {
    @IsInt({ message: 'Добовий ліміт завантажень повинен бути цілим числом.' })
    @Min(0, { message: 'Добовий ліміт завантажень не може бути менше 0.' })
    @IsOptional()
    limit?: number;
}