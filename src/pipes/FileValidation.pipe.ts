import { ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common'
import { fileTypeFromBuffer } from 'file-type'
import { SystemSettingQueryService } from 'src/modules/system-setting/services/system-setting-query.service'

@Injectable()
export class FileValidationPipe implements PipeTransform {
	constructor(
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	async transform(value: any, metadata: ArgumentMetadata) {
		if (!value || !value.buffer || !value.originalname) {
			throw new UnprocessableEntityException('File is missing or invalid')
		}

		const ext = value.originalname.split('.').pop()?.toLowerCase()

		const allowedTypes = (await this.systemSettingQueryService.getSettings(['allowed file extensions']))('allowed file extensions')
		const fileType = ext ? allowedTypes[ext] : null

		if (!fileType || !fileType.allowed) {
			throw new UnprocessableEntityException(`Unsupported file extension: .${ext}`)
		}

		const detectedType = await fileTypeFromBuffer(value.buffer)
		if (!detectedType || detectedType.mime !== fileType.mime) {
			throw new UnprocessableEntityException(
				`Invalid MIME type for .${ext} file. Expected: ${fileType.mime}, but got: ${detectedType?.mime || 'unknown'}`
			)
		}

		if (value.size > fileType.maxSizeMb * 1024 * 1024) {
			const maxMb = fileType.maxSizeMb 
			throw new UnprocessableEntityException(`File exceeds maximum allowed size of ${maxMb}MB`)
		}

		return value
	}
}
