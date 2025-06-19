import { Module } from '@nestjs/common'

import { DocumentModule } from '../document/document.module'
import { UserModule } from '../user/user.module'

import { StatisticController } from './statistic.controller'
import { StatisticService } from './statistic.service'

@Module({
	imports: [UserModule, DocumentModule],
	controllers: [StatisticController],
	providers: [StatisticService]
})
export class StatisticModule {}
