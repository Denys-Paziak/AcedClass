import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import * as getRawBody from 'raw-body'

import { AppModule } from './modules/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	app.useGlobalPipes(new ValidationPipe({ transform: true }))
	app.enableCors({
		credentials: true,
		origin: 'http://localhost:3000',
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
