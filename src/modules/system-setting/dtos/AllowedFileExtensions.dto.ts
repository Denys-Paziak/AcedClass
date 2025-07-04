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
	@ApiProperty({
		description: 'Settings for PDF files',
		type: FileExtensionSettings,
		required: false
	})
	pdf?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for DOC files',
		type: FileExtensionSettings,
		required: false
	})
	doc?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for DOCX files',
		type: FileExtensionSettings,
		required: false
	})
	docx?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for XLS files',
		type: FileExtensionSettings,
		required: false
	})
	xls?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for XLSX files',
		type: FileExtensionSettings,
		required: false
	})
	xlsx?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for PPT files',
		type: FileExtensionSettings,
		required: false
	})
	ppt?: FileExtensionSettings

	@ValidateNested()
	@Type(() => FileExtensionSettings)
	@IsOptional()
	@ApiProperty({
		description: 'Settings for PPTX files',
		type: FileExtensionSettings,
		required: false
	})
	pptx?: FileExtensionSettings
}
