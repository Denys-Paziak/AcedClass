import { Global, Module } from '@nestjs/common'
import { ElasticSearchService } from './elastic-search.service';
import { ElasticSearchController } from './elastic-search.controller';
import { DocumentModule } from '../document/document.module';

@Global()
@Module({
    imports: [DocumentModule],
    controllers: [ElasticSearchController],
    providers: [ElasticSearchService]
})
export class ElasticSearchModule {}
