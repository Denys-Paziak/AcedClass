import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserAdminController } from './controllers/user-admin.controller'
import { UserController } from './controllers/user.controller'
import { User } from './entities/User.entity'
import { UserCommandService } from './services/user-command.service'
import { UserCronService } from './services/user-cron.service'
import { UserQueryService } from './services/user-query.service'
import { UserSystemService } from './services/user-system.service'

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UserController, UserAdminController],
	providers: [UserCommandService, UserCronService, UserQueryService, UserSystemService],
	exports: [UserCommandService, UserQueryService, UserSystemService]
})
export class UserModule {}
