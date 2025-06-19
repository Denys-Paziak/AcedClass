import { EPointTypes } from 'src/interfaces/EPointTypes'
import { Document } from 'src/modules/document/entities/Document.entity'
import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'unlocked-document' })
export class UnlockedDocument {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'enum', enum: EPointTypes, default: EPointTypes.POINT, name: "point_type" })
	pointType: EPointTypes

	@ManyToOne(() => User, user => user.unlockedDocuments, {
		onDelete: 'SET NULL',
		nullable: true
	})
	@JoinColumn({ name: 'user_id' })
	user: User | null

	@ManyToOne(() => Document, document => document.unlockedDocuments, {
		onDelete: 'SET NULL',
		nullable: true
	})
	@JoinColumn({ name: 'document_id' })
	document: Document | null

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
	updatedAt: Date
}
