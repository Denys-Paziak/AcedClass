import { Global, Module } from '@nestjs/common'
import { ElasticLogsInitializerService } from './logger.service';

@Global()
@Module({
    providers: [ElasticLogsInitializerService]
})
export class LoggerModule {}
