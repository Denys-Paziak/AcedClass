import { Global, Module } from '@nestjs/common'
import { ElasticLogsInitializerService } from './logger.service';
import { WinstonLogger } from './winston.logger';

@Global()
@Module({
    providers: [ElasticLogsInitializerService, WinstonLogger],
    exports: [WinstonLogger]
})
export class LoggerModule {}
