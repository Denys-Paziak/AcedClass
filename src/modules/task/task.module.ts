import { Module } from '@nestjs/common'

import { DocumentModule } from '../document/document.module'
import { PointModule } from '../point/point.module'
import { UserModule } from '../user/user.module'

import { TaskService } from './task.service'

@Module({
	imports: [PointModule, UserModule, DocumentModule],
	providers: [TaskService]
})
export class TaskModule {}
