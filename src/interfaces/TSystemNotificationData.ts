import { Document } from 'src/modules/document/entities/Document.entity'
import { Point } from 'src/modules/point/entities/Point.entity'

import { ESystemNotificationTypes } from './ESystemNotificationTypes'
import { TPointSource } from './TPointSource'

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
			source: TPointSource
			pointsId: Point['id']
			burningDate: Date
	  }
	| { type: ESystemNotificationTypes.FILE_APPROVED; documentId: Document['id'] }
	| { type: ESystemNotificationTypes.FILE_FLAGGED; documentId: Document['id'] }
	| { type: ESystemNotificationTypes.FILE_REJECTED; documentId: Document['id'] }
