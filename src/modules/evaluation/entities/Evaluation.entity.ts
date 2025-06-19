import { EEvaluationTypes } from 'src/interfaces/EEvaluationTypes'
import { Document } from 'src/modules/document/entities/Document.entity'
import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'evaluation' })
export class Evaluation {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'enum', enum: EEvaluationTypes })
	@Index()
	type: EEvaluationTypes

	@Column({ type: 'varchar', length: 255})
	tags: string

	@ManyToOne(() => User, user => user.evaluations, {
		onDelete: 'SET NULL',
		nullable: true
	})
	@JoinColumn({ name: 'user_id' })
	user: User | null

	@ManyToOne(() => Document, document => document.evaluations, {
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'document_id' })
	document: Document

	@CreateDateColumn({ type: 'timestamptz',  select: false })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz',  select: false })
	updatedAt: Date
}
