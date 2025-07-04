import { ISystemSetting } from '../../../interfaces/ISystemSetting'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'system-setting' })
export class SystemSetting {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 255 })
	name: string

	@Column({ type: 'jsonb' })
	data: ISystemSetting

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at', select: false })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', select: false })
	updatedAt: Date
}
