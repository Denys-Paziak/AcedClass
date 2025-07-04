import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import * as getRawBody from 'raw-body'

import { AppModule } from './modules/app.module'
import { LoggerInterceptor } from './modules/logger/logger.interceptor'
import { WinstonLogger } from './modules/logger/winston.logger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true
	})

	const config = app.get(ConfigService)

	const winstonLogger = app.get(WinstonLogger)
	if (config.getOrThrow('NODE_ENV') !== 'development') {
		app.useLogger(winstonLogger);
	}
	app.useGlobalInterceptors(new LoggerInterceptor(winstonLogger))
console.log('NODE_ENV from config:', config.get('NODE_ENV'))
console.log('NODE_ENV from process.env:', process.env.NODE_ENV)
	app.useGlobalPipes(new ValidationPipe({ transform: true }))
	app.enableCors({
		credentials: true,
		origin: config.getOrThrow('FRONT_ORIGIN_URL'),
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
	})
	app.use(cookieParser())

	const configSwagger = new DocumentBuilder().setTitle('AcedClass API').setVersion('1.0').build()
	const documentFactory = () => SwaggerModule.createDocument(app, configSwagger)
	SwaggerModule.setup('api', app, documentFactory)

	app.use('/stripe/webhook', (req, res, next) => {
		getRawBody(req, {
			length: req.headers['content-length'],
			limit: '1mb',
			encoding: 'utf8'
		})
			.then(buf => {
				;(req as any).rawBody = buf
				next()
			})
			.catch(err => {
				next(err)
			})
	})

	app.use(json())
	app.use(urlencoded({ extended: true }))

	await app.listen(config.getOrThrow('SERVER_PORT'))
}
bootstrap()
