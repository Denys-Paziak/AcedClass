import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getPostgresConfig } from 'src/configs/postgres.config'
import { getThrottlerConfig } from 'src/configs/throttler.config'

import { AuthModule } from './auth/auth.module'
import { ComplaintModule } from './complaint/complaint.module'
import { DocumentModule } from './document/document.module'
import { EvaluationModule } from './evaluation/evaluation.module'
import { MailModule } from './mail/mail.module'
import { MessageModule } from './message/message.module'
import { PointModule } from './point/point.module'
import { StatisticModule } from './statistic/statistic.module'
import { StripeModule } from './stripe/stripe.module'
import { SystemNotificationModule } from './system-notification/system-notification.module'
import { SystemSettingModule } from './system-setting/system-setting.module'
import { TaskMetodsModule } from './task/task-metods.module'
import { TaskModule } from './task/task.module'
import { TokenModule } from './token/token.module'
import { UniversityModule } from './university/university.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ScheduleModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env.development.local'
		}),
		TypeOrmModule.forRootAsync(getPostgresConfig()),
		ThrottlerModule.forRootAsync(getThrottlerConfig()),
		UserModule,
		AuthModule,
		TokenModule,
		MailModule,
		DocumentModule,
		PointModule,
		TaskModule,
		TaskMetodsModule,
		EvaluationModule,
		ComplaintModule,
		MessageModule,
		SystemNotificationModule,
		SystemSettingModule,
		StatisticModule,
		UniversityModule,
		StripeModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class AppModule {}
