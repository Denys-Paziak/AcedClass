import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SystemNotification } from './entities/System-notification.entity'
import { SystemNotificationQueryService } from './services/system-notification-query.service'
import { SystemNotificationSystemService } from './services/system-notification-system.service'
import { SystemNotificationController } from './system-notification.controller'

@Module({
	imports: [TypeOrmModule.forFeature([SystemNotification])],
	controllers: [SystemNotificationController],
	providers: [SystemNotificationQueryService, SystemNotificationSystemService],
	exports: [SystemNotificationQueryService, SystemNotificationSystemService]
})
export class SystemNotificationModule {}
