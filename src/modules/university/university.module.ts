import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UniversityAdminController } from './controllers/university-admin.controller'
import { UniversityController } from './controllers/university.controller'
import { University } from './entities/University.entity'
import { UniversityService } from './university.service'

@Module({
	imports: [TypeOrmModule.forFeature([University])],
	controllers: [UniversityController, UniversityAdminController],
	providers: [UniversityService]
})
export class UniversityModule {}
