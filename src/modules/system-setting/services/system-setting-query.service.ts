import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ISystemSetting } from '../../../interfaces/ISystemSetting'
import { SystemSetting } from '../entities/System-setting.entity'

@Injectable()
export class SystemSettingQueryService {
	constructor(
		@InjectRepository(SystemSetting)
		private readonly systemSettingRepository: Repository<SystemSetting>
	) {}

	async getSettings(options: ISystemSetting['name'][]) {
		const settings = await this.systemSettingRepository.find({
			where: options.map(item => ({ name: item }))
		})

		return <N extends ISystemSetting['name']>(settingName: N) => {
			const setting = settings.find(item => item.name === settingName)

			if (setting) {
				return setting.data.data as Extract<ISystemSetting, { name: N }>['data']
			}

			throw new InternalServerErrorException()
		}
	}
}
