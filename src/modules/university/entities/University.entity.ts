import { Document } from '../../../modules/document/entities/Document.entity'
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'university' })
export class University {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 255 })
	@Index()
	name: string

	@OneToMany(() => Document, document => document.university)
	documents: Document[]

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
	updatedAt: Date
}
