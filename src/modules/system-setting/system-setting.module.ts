import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SystemSetting } from './entities/System-setting.entity'
import { SystemSettingCommandService } from './services/system-setting-command.service'
import { SystemSettingQueryService } from './services/system-setting-query.service'
import { SystemSettingController } from './system-setting.controller'
import { UserModule } from '../user/user.module'

@Module({
	imports: [TypeOrmModule.forFeature([SystemSetting]), UserModule],
	controllers: [SystemSettingController],
	providers: [SystemSettingCommandService, SystemSettingQueryService],
	exports: [SystemSettingQueryService]
})
export class SystemSettingModule {}
