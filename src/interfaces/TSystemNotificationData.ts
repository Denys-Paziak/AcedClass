import { Document } from '../modules/document/entities/Document.entity'
import { Point } from '../modules/point/entities/Point.entity'

import { ESystemNotificationTypes } from './ESystemNotificationTypes'
import { TPointSource } from './TPointSource'
import { TRevealSource } from './TRevealSource'

export type TSystemNotificationData =
	| {
			type: ESystemNotificationTypes.ADD_POINTS
			totalEarned: number
			source: TPointSource
			pointsId: Point['id']
			burningDate: Date
	  }
	| {
			type: ESystemNotificationTypes.ADD_REVEALS
			totalEarned: number
			source: TRevealSource
			pointsId: Point['id']
			burningDate: Date
	  }
	| { type: ESystemNotificationTypes.FILE_APPROVED; documentId: number, documentName: string }
	| { type: ESystemNotificationTypes.FILE_FLAGGED; documentId: number, documentName: string }
	| { type: ESystemNotificationTypes.FILE_REJECTED; documentId: number, documentName: string }
	| { type: ESystemNotificationTypes.PROCESSING_FAILED; documentId: number, documentName: string }
