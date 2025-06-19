import { EPointTypes } from 'src/interfaces/EPointTypes'
import { TPointSource } from 'src/interfaces/TPointSource'
import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'point' })
export class Point {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => User, user => user.points, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'user_id' })
	user: User | null

	@Column({name: "total_earned" , type: 'int' })
	@Index()
	totalEarned: number

	@Column({name: "available" , type: 'int' })
	@Index()
	available: number

	@Column({ type: 'enum', enum: EPointTypes })
	@Index()
	type: EPointTypes

	@Column({ type: 'jsonb', default: "{}" })
	source: TPointSource

	@Column({ type: 'boolean', default: false })
	frozen: boolean

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
	@Index()
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
	updatedAt: Date
}
