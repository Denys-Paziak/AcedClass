import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { SystemSetting } from '../entities/System-setting.entity'

@Injectable()
export class SystemSettingQueryService {
    constructor(
        @InjectRepository(SystemSetting)
        private readonly systemSettingRepository: Repository<SystemSetting>
    ) {}

    async allowedFileExtensions() {
        return await this.systemSettingRepository.findOne({
            where: { name: 'allowed file extensions' }
        })
    }
}
