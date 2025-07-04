export type ISystemSetting =
	| { name: 'allowed file extensions'; data: Record<string, { mime: string; maxSizeMb: number; allowed: boolean }> }
	| { name: 'daily limit uploads'; data: { limit: number; active: boolean } }
	| {
			name: 'reveal settings'
			data: {
				defaultDelay: number
				university: { delay: number; active: boolean }
				course: { delay: number; active: boolean }
			}
	  }
	| {
			name: 'feature toggles'
			data: {
				documentUploading: boolean
				documentRevealing: boolean
				votingSystem: boolean
				contentReporting: boolean
			}
	  }
	| {
			name: 'moderation'
			data: {
				requaireModeratorApproval: boolean
				flaggedThreshold: number
				rejectedThreshold: number
			}
	  }
	| {
			name: 'notification'
			data: {
				adminAlertThreshold: number,
				adminAlertInterval: number,
				adminNotificationRecipients: string[]
			}
	  }
