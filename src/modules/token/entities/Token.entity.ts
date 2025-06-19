import { ETokenTypes } from 'src/interfaces/ETokenTypes'
import { User } from 'src/modules/user/entities/User.entity'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'token' })
export class Token {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', unique: true })
	tokenOrCode: string

	@Column({
		type: 'timestamptz',
		name: 'expires_in'
	})
	expiresIn: Date

	@Column({ type: 'enum', enum: ETokenTypes })
	type: ETokenTypes

	@ManyToOne(() => User, user => user.tokens, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User

	@CreateDateColumn({ type: 'timestamptz', select: false })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', select: false })
	updatedAt: Date
}
