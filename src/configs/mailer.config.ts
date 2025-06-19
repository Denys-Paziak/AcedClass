import type { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { parseBoolean } from 'src/utils/parse-boolean.util'

export function getMailerConfig(): MailerAsyncOptions {
	return {
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			transport: {
				host: configService.getOrThrow<string>('MAIL_HOST'),
				port: configService.getOrThrow<number>('MAIL_PORT'),
				secure: parseBoolean(
					configService.getOrThrow<string>('MAIL_SECURE')
				),
				auth: {
					user: configService.getOrThrow<string>('MAIL_USER'),
					pass: configService.getOrThrow<string>('MAIL_PASSWORD')
				}
			},
			defaults: {
				from: `"Команда [name]" ${configService.getOrThrow<string>('MAIL_USER')}`
			}
		})
	}
}
