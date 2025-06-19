import { Document } from 'src/modules/document/entities/Document.entity'

export type TPointSource = { type: 'document'; id: Document['id'] } | { type: 'evaluation' } | { type: 'admin' }
