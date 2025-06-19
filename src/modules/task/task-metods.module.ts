import { Module } from '@nestjs/common'

import { TaskMetodsService } from './task-metods.service'

@Module({
    providers: [TaskMetodsService],
    exports: [TaskMetodsService]
})
export class TaskMetodsModule {}
