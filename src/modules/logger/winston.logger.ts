import { Client } from '@elastic/elasticsearch'
import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common'
import * as winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

@Injectable()
export class WinstonLogger implements LoggerService, OnModuleInit {
	private loggerInstance: winston.Logger

	onModuleInit() {
		const node = process.env.ELASTICSEARCH_API_NODE

		if (!node) {
			throw new Error('Missing ELASTICSEARCH_API_NODE in environment')
		}

		const esClient = new Client({ node })

		const esTransport = new ElasticsearchTransport({
			level: 'info',
			client: esClient,
			index: 'acedclass-logs'
		})

		this.loggerInstance = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				winston.format.json()
			),
			transports: [esTransport]
		})
	}

	log(message: string, ...optionalParams: any[]) {
		this.loggerInstance?.info(message, { extra: optionalParams })
	}

	error(message: string, trace?: string, ...optionalParams: any[]) {
		this.loggerInstance?.error(message, { trace, extra: optionalParams })
	}

	warn(message: string, ...optionalParams: any[]) {
		this.loggerInstance?.warn(message, { extra: optionalParams })
	}

	debug(message: string, ...optionalParams: any[]) {
		this.loggerInstance?.debug(message, { extra: optionalParams })
	}

	verbose(message: string, ...optionalParams: any[]) {
		this.loggerInstance?.verbose(message, { extra: optionalParams })
	}
}
