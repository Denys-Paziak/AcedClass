import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class IdParamDto {
    @Type(() => Number)
    @IsInt({ message: 'ID must be an integer' })
    @Min(0, {message: 'The value cannot be less than zero.'})
    id: number;
  }