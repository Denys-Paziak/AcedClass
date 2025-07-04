import { ESystemNotificationTypes } from '../../../interfaces/ESystemNotificationTypes'
import { TSystemNotificationData } from '../../../interfaces/TSystemNotificationData'
import { User } from '../../../modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'system-notification' })
export class SystemNotification {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'enum', enum: ESystemNotificationTypes })
	type: ESystemNotificationTypes

	@Column({ type: 'jsonb' })
	data: TSystemNotificationData

	@ManyToOne(() => User, user => user.systemNotifications, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User

	@CreateDateColumn({ type: 'timestamptz', select: false })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', select: false })
	updatedAt: Date
}
