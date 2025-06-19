import { EComplaintFlags } from 'src/interfaces/EComplaintFlags'
import { EComplaintStatus } from 'src/interfaces/EComplaintStatus'
import { Document } from 'src/modules/document/entities/Document.entity'
import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'complaint' })
export class Complaint {
	@PrimaryGeneratedColumn()
	id: number

    @Column({ type: 'enum', enum: EComplaintFlags })
    flag: EComplaintFlags

	@Column({ type: 'text' })
	message: string

	@Column({ type: 'text' })
	adminComment: string

	@Column({ type: 'enum', enum: EComplaintStatus, default: EComplaintStatus.PENDING })
	status: EComplaintStatus

	@ManyToOne(() => User, user => user.complaintsSent, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'author_id' })
	author: User | null

	@ManyToOne(() => User, user => user.complaintsReceived, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'user_id' })
	user: User | null

	@ManyToOne(() => Document, document => document.complaints, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'document_id' })
	document: Document | null

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date
}
