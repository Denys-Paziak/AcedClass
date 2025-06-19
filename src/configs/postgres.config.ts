import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'

export function getPostgresConfig(): TypeOrmModuleAsyncOptions {
	return {
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			type: 'postgres',
			host: configService.getOrThrow<string>('POSTGRES_HOST'),
			port: +configService.getOrThrow<number>('POSTGRES_PORT'),
			username: configService.getOrThrow<string>('POSTGRES_USER'),
			password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
			database: configService.getOrThrow<string>('POSTGRES_DB'),
			autoLoadEntities: true,
			synchronize: true
		})
	}
}
