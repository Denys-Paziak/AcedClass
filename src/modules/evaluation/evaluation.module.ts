import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DocumentModule } from '../document/document.module'
import { PointModule } from '../point/point.module'
import { SystemSettingModule } from '../system-setting/system-setting.module'

import { Evaluation } from './entities/Evaluation.entity'
import { EvaluationController } from './evaluation.controller'
import { EvaluationService } from './evaluation.service'

@Module({
	imports: [TypeOrmModule.forFeature([Evaluation]), DocumentModule, PointModule, SystemSettingModule],
	controllers: [EvaluationController],
	providers: [EvaluationService]
})
export class EvaluationModule {}
