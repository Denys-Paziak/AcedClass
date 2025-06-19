export type ISystemSetting =
	| { name: 'allowed file extensions'; data: Record<string, { mime: string; maxSizeMb: number; allowed: boolean }> }
	| { name: 'daily limit uploads', data: { limit: number, active: boolean } }
