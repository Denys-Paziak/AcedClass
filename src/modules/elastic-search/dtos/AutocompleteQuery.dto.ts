import { IsString } from "class-validator";

export class AutocompleteQueryDto {
    @IsString()
    search: string
}