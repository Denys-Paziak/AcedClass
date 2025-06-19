import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MailModule } from '../mail/mail.module'
import { UserModule } from '../user/user.module'

import { MessageAdminController } from './controllers/message-admin.controller'
import { MessageController } from './controllers/message.controller'
import { Message } from './entities/Message.entity'
import { MessageCommandService } from './services/message-command.service'
import { MessageQueryService } from './services/message-query.service'

@Module({
	imports: [TypeOrmModule.forFeature([Message]), MailModule, UserModule],
	controllers: [MessageController, MessageAdminController],
	providers: [MessageQueryService, MessageCommandService]
})
export class MessageModule {}
