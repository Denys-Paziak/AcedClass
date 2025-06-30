import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, Min, ValidateNested } from 'class-validator'

class FileExtensionSettings {
	@IsInt()
	@Min(1)
	@IsOptional()
    @ApiProperty({
        description: 'Maximum file size in megabytes',
        example: 40,
        type: Number,
        minimum: 1,
		required: false
    })
	maxSizeMb?: number

	@IsBoolean()
	@IsOptional()
    @ApiProperty({
        description: 'Is this file type allowed to be used',
        example: true,
        type: Boolean,
		required: false
    })
	allowed?: boolean
}

export class AllowedFileExtensionsDto {
	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	pdf?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	doc?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	docx?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	xls?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	xlsx?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	ppt?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	pptx?: FileExtensionSettings
}
