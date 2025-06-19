import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'message' })
export class Message {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 100 })
	subject: string

	@Column({ type: 'text' })
	message: string

	@ManyToOne(() => User, user => user.messagesSent, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'author_id' })
	author: User | null

	@ManyToOne(() => User, user => user.messagesReceived, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'recipient_id' })
	recipient: User

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    @Index()
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
	updatedAt: Date
}
