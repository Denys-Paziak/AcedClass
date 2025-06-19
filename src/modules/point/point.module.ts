import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DocumentModule } from '../document/document.module'
import { SystemNotificationModule } from '../system-notification/system-notification.module'
import { TaskMetodsModule } from '../task/task-metods.module'
import { UserModule } from '../user/user.module'

import { PointAdminController } from './controllers/point-admin.controller'
import { PointController } from './controllers/point.controller'
import { Point } from './entities/Point.entity'
import { PointCommandService } from './services/point-command.service'
import { PointQueryService } from './services/point-query.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([Point]),
		TaskMetodsModule,
		forwardRef(() => DocumentModule),
		SystemNotificationModule,
		UserModule
	],
	controllers: [PointController, PointAdminController],
	providers: [PointQueryService, PointCommandService],
	exports: [PointQueryService, PointCommandService]
})
export class PointModule {}
