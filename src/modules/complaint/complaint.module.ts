import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DocumentModule } from '../document/document.module'
import { SystemSettingModule } from '../system-setting/system-setting.module'
import { TaskMetodsModule } from '../task/task-metods.module'

import { ComplaintAdminController } from './controllers/complaint-admin.controller'
import { ComplaintController } from './controllers/complaint.controller'
import { Complaint } from './entities/Complaint.entity'
import { ComplaintCommandService } from './services/complaint-command.service'
import { ComplaintQueryService } from './services/complaint-query.service'

@Module({
	imports: [TypeOrmModule.forFeature([Complaint]), DocumentModule, TaskMetodsModule, SystemSettingModule],
	controllers: [ComplaintController, ComplaintAdminController],
	providers: [ComplaintQueryService, ComplaintCommandService]
})
export class ComplaintModule {}
