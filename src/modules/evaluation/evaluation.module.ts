import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Evaluation } from './entities/Evaluation.entity'
import { EvaluationController } from './evaluation.controller'
import { EvaluationService } from './evaluation.service'
import { DocumentModule } from '../document/document.module'
import { PointModule } from '../point/point.module'

@Module({
	imports: [TypeOrmModule.forFeature([Evaluation]), DocumentModule, PointModule],
	controllers: [EvaluationController],
	providers: [EvaluationService]
})
export class EvaluationModule {}
