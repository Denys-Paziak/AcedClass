import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { ERegistrationTypes } from '../../../interfaces/ERegistrationTypes'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ESubscriptionStatuses } from '../../../interfaces/ESubscriptionStatuses'
import { Complaint } from '../../../modules/complaint/entities/Complaint.entity'
import { Document } from '../../../modules/document/entities/Document.entity'
import { UnlockedDocument } from '../../../modules/document/entities/Unlocked-document.entity'
import { Evaluation } from '../../../modules/evaluation/entities/Evaluation.entity'
import { Message } from '../../../modules/message/entities/Message.entity'
import { Point } from '../../../modules/point/entities/Point.entity'
import { SystemNotification } from '../../../modules/system-notification/entities/System-notification.entity'
import { Token } from '../../../modules/token/entities/Token.entity'

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ name: 'username', type: 'varchar', length: 50, unique: true })
	username: string

	@Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
	firstName: string | null

	@Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
	lastName: string | null

	@Column({ type: 'varchar', length: 255 })
	email: string

	@Column({ type: 'varchar', length: 20, unique: true, nullable: true })
	phone: string | null

	@Column({ type: 'varchar', length: 255, select: false, nullable: true })
	password: string | null

	@Column({ type: 'enum', enum: ERoleNames, default: ERoleNames.USER })
	role: ERoleNames

	@Column({ type: 'enum', enum: ERegistrationTypes, default: ERegistrationTypes.PASSWORD, name: 'registration_type' })
	registrationType: ERegistrationTypes

	@OneToMany(() => Token, token => token.user)
	tokens: Token[]

	@OneToMany(() => Point, point => point.user)
	points: Point[]

	@OneToMany(() => Document, document => document.user)
	documents: Document[]

	@OneToMany(() => Evaluation, evaluation => evaluation.user)
	evaluations: Evaluation[]

	@OneToMany(() => UnlockedDocument, unlockedDocument => unlockedDocument.user)
	unlockedDocuments: UnlockedDocument[]

	@OneToMany(() => Complaint, complaint => complaint.user)
	complaintsReceived: Complaint[]

	@OneToMany(() => Complaint, complaint => complaint.author)
	complaintsSent: Complaint[]

	@OneToMany(() => Message, message => message.recipient)
	messagesReceived: Message[]

	@OneToMany(() => Message, message => message.author)
	messagesSent: Message[]

	@OneToMany(() => SystemNotification, systemNotification => systemNotification.user)
	systemNotifications: SystemNotification[]

	@Column({
		name: 'approval_level',
		type: 'float',
		default: 100
	})
	approvalLevel: number

	@Column({ name: 'daily_limit_uploads', type: 'int' })
	dailyLimitUploads: number

	@Column({ name: 'bonus_daily_limit_uploads', type: 'int', default: 0 })
	bonusDailyLimitUploads: number

	@Column({ name: 'daily_count_uploads', type: 'int', default: 0 })
	dailyCountUploads: number

	@Column({ type: 'timestamptz', name: 'account_blocking', nullable: true })
	accountBlocking: Date | null

	@Column({ type: 'text', name: 'reason_blocking', nullable: true })
	reasonBlocking: string | null

	@Column({ type: 'timestamptz', name: 'upload_blocking', nullable: true })
	uploadBlocking: Date | null

	@Column({ type: 'int', nullable: true, name: 'strike_counter' })
	strikeCounter: number | null

	@Column({ name: 'email_notifications', type: 'boolean', default: true })
	emailNotifications: boolean

	@Column({ name: 'document_approval_alerts', type: 'boolean', default: true })
	documentApprovalAlerts: boolean

	@Column({ type: 'timestamptz', name: 'last_activity', default: 'NOW()' })
	lastActivity: Date

	@Column({ nullable: true, name: 'stripe_customer_id', type: 'varchar', length: 255 })
	stripeCustomerId: string | null

	@Column({ nullable: true, name: 'stripe_subscription_id', type: 'varchar', length: 255 })
	stripeSubscriptionId: string | null

	@Column({ type: 'varchar', length: 255, nullable: true })
	subscription: string | null

	@Column({
		type: 'enum',
		enum: ESubscriptionStatuses,
		nullable: true,
		name: 'subscribed_status'
	})
	subscribedStatus: ESubscriptionStatuses | null

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
	@Index()
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
	updatedAt: Date
}
