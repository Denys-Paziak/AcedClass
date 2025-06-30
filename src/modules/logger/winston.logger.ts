import { Client } from '@elastic/elasticsearch'
import { LoggerService } from '@nestjs/common'
import * as winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

const esClient = new Client({
	node: process.env.ELASTICSEARCH_API_NODE || '',
	auth: {
		apiKey: process.env.ELASTICSEARCH_API_KEY || ''
	}
})

const esTransport = new ElasticsearchTransport({
	level: 'info',
	client: esClient,
	index: 'acedclass-logs'
})

const loggerInstance = winston.createLogger({
	level: 'info',
	format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
	transports: [esTransport]
})

export class WinstonLogger implements LoggerService {
	log(message: string, ...optionalParams: any[]) {
		loggerInstance.info(message, { extra: optionalParams })
	}

	error(message: string, trace?: string, ...optionalParams: any[]) {
		loggerInstance.error(message, { trace, extra: optionalParams })
	}

	warn(message: string, ...optionalParams: any[]) {
		loggerInstance.warn(message, { extra: optionalParams })
	}

	debug(message: string, ...optionalParams: any[]) {
		loggerInstance.debug(message, { extra: optionalParams })
	}

	verbose(message: string, ...optionalParams: any[]) {
		loggerInstance.verbose(message, { extra: optionalParams })
	}
}
