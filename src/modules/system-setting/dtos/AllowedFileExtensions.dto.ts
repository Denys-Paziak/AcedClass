import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsPositive, Min, ValidateNested } from 'class-validator'

class FileExtensionSettings {
	@IsNumber()
	@IsPositive()
	@Min(1)
	@IsOptional()
    @ApiProperty({
        description: 'Максимальний розмір файлу в мегабайтах',
        example: 40,
        type: Number,
        minimum: 1,
		required: false
    })
	maxSizeMb?: number

	@IsBoolean()
	@IsOptional()
    @ApiProperty({
        description: 'Чи дозволено використовувати цей тип файлу',
        example: true,
        type: Boolean,
		required: false
    })
	allowed?: boolean
}

export class AllowedFileExtensionsDto {
	@ValidateNested()
	@Type(() => FileExtensionSettings)
	pdf: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	doc: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	docx: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	xls: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	xlsx: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	ppt: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	pptx: FileExtensionSettings
}
