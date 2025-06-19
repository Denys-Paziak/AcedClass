import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileValidationPipe } from 'src/pipes/FileValidation.pipe'

import { PointModule } from '../point/point.module'
import { SystemNotificationModule } from '../system-notification/system-notification.module'
import { TaskMetodsModule } from '../task/task-metods.module'
import { UserModule } from '../user/user.module'

import { DocumentAdminController } from './controllers/document-admin.controller'
import { DocumentController } from './controllers/document.controller'
import { UnlockedDocumentAdminController } from './controllers/unlocked-document-admin.controller'
import { UnlockedDocumentController } from './controllers/unlocked-document.controller'
import { Document } from './entities/Document.entity'
import { UnlockedDocument } from './entities/Unlocked-document.entity'
import { DocumentCommandService } from './services/document-command.service'
import { DocumentQueryService } from './services/document-query.service'
import { DocumentSystemService } from './services/document-system.service'
import { UnlockedDocumentService } from './services/unlocked-document.service'
import { SystemSettingModule } from '../system-setting/system-setting.module'

@Module({
	imports: [
		TypeOrmModule.forFeature([Document, UnlockedDocument]),
		TaskMetodsModule,
		UserModule,
		forwardRef(() => PointModule),
		SystemNotificationModule,
		SystemSettingModule
	],
	controllers: [DocumentController, UnlockedDocumentController, DocumentAdminController, UnlockedDocumentAdminController],
	providers: [DocumentCommandService, DocumentQueryService, DocumentSystemService, UnlockedDocumentService, FileValidationPipe],
	exports: [DocumentCommandService, DocumentQueryService, DocumentSystemService, UnlockedDocumentService]
})
export class DocumentModule {}
