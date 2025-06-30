import { Document } from 'src/modules/document/entities/Document.entity'
import { Point } from 'src/modules/point/entities/Point.entity'

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
	| { type: ESystemNotificationTypes.FILE_APPROVED; documentId: Document['id'] }
	| { type: ESystemNotificationTypes.FILE_FLAGGED; documentId: Document['id'] }
	| { type: ESystemNotificationTypes.FILE_REJECTED; documentId: Document['id'] }
