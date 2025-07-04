import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FileValidationPipe } from '../../pipes/FileValidation.pipe'
import { MailModule } from '../mail/mail.module'
import { PointModule } from '../point/point.module'
import { SystemNotificationModule } from '../system-notification/system-notification.module'
import { SystemSettingModule } from '../system-setting/system-setting.module'
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

@Module({
	imports: [
		TypeOrmModule.forFeature([Document, UnlockedDocument]),
		TaskMetodsModule,
		UserModule,
		forwardRef(() => PointModule),
		SystemNotificationModule,
		SystemSettingModule,
		MailModule
	],
	controllers: [DocumentController, UnlockedDocumentController, DocumentAdminController, UnlockedDocumentAdminController],
	providers: [DocumentCommandService, DocumentQueryService, DocumentSystemService, UnlockedDocumentService, FileValidationPipe],
	exports: [DocumentCommandService, DocumentQueryService, DocumentSystemService, UnlockedDocumentService]
})
export class DocumentModule {}
