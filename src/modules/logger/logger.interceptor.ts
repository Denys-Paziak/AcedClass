import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { catchError, Observable, tap } from 'rxjs'

import { ITokenUser } from '../../interfaces/ITokenUser'

import { WinstonLogger } from './winston.logger'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
	constructor(private readonly logger: WinstonLogger) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx = context.switchToHttp()
		const request = ctx.getRequest<Request>()
		const response = ctx.getResponse<Response>()
		const { method, originalUrl, body, query, params, user } = request

		const startTime = Date.now()

		if (!((originalUrl === '/documents' && method === 'POST') || (originalUrl === '/stripe/webhook' && method === 'POST'))) {
			this.logger.log(
				`➡️ Request: ${method} ${originalUrl} `,
				`User: ${(user as ITokenUser)?.id || 'Not Auth'} | Params: ${JSON.stringify(this.sanitizeBody(params))} | Query: ${JSON.stringify(this.sanitizeBody(query))} | Body: ${JSON.stringify(this.sanitizeBody(body))}`
			)
		}

		return next.handle().pipe(
			tap(() => {
				const statusCode = response.statusCode
				const duration = Date.now() - startTime

				if (!(originalUrl === '/stripe/webhook' && method === 'POST')) {
					this.logger.log(`⬅️ Response: ${method} ${originalUrl} [${statusCode}]`, `${duration}ms`)
				}
			}),
			catchError(err => {
				const duration = Date.now() - startTime

				if (!(originalUrl === '/stripe/webhook' && method === 'POST')) {
					if (!err.status || err.status >= 500) {
						this.logger.error(
							`❌ Error: ${method} ${originalUrl} [${err.status || 500}]`,
							err.stack,
							`Error: ${JSON.stringify(err.message || err)} - ${duration}ms`
						)
					} else if (err.status >= 400) {
						this.logger.warn(
							`⚠️ Warn: ${method} ${originalUrl} [${err.status}]`,
							`Error: ${JSON.stringify(err.response || err)} - ${duration}ms`
						)
					}
				}

				throw err
			})
		)
	}

	private sanitizeBody(body: any) {
		if (!body || typeof body !== 'object') return body

		try {
			const clone = { ...body }

			const sensitiveFields = ['password', 'username', 'first_name', 'last_name', 'phone', 'email', 'file', 'buffer']
			for (const key of Object.keys(clone)) {
				if (typeof clone[key] === 'object' || clone[key] instanceof Buffer || sensitiveFields.includes(key)) {
					clone[key] = '[filtered]'
				}
			}
			return clone
		} catch {
			return '[unserializable body]'
		}
	}
}
