import { Document } from '../modules/document/entities/Document.entity'

export type TPointSource = { type: 'document'; id: number } | { type: 'evaluation' } | { type: 'admin' }
