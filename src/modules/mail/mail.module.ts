import { MailerModule } from '@nestjs-modules/mailer'
import { Global, Module } from '@nestjs/common'
import { getMailerConfig } from 'src/configs/mailer.config'

import { MailService } from './mail.service'

@Global()
@Module({
	imports: [MailerModule.forRootAsync(getMailerConfig())],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
