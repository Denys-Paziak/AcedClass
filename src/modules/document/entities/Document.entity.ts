import { EDocumentStatuses } from 'src/interfaces/EDocumentStatuses'
import { Complaint } from 'src/modules/complaint/entities/Complaint.entity'
import { UnlockedDocument } from 'src/modules/document/entities/Unlocked-document.entity'
import { Evaluation } from 'src/modules/evaluation/entities/Evaluation.entity'
import { University } from 'src/modules/university/entities/University.entity'
import { User } from 'src/modules/user/entities/User.entity'
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'document' })
export class Document {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 255 })
	name: string

	@Column({ type: 'varchar', length: 255, default: '' })
	description: string

	@Column({ type: 'varchar', length: 300, unique: true, name: 'system_name' })
	systemName: string

	@Column({ type: 'varchar', name: 'link_file', length: 1024, default: '', select: false })
	linkFile: string

	@Column({ type: 'text', name: 'links_blur_file', default: '' })
	linksBlurFile: string

	@Column({ type: 'varchar', name: 'link_preview', length: 1024, default: '' })
	linkPreview: string

	@ManyToOne(() => University, university => university.documents, {
		onDelete: 'SET NULL',
		nullable: true
	})
	@JoinColumn({ name: 'university_id' })
	university: University | null

	@Column({ type: 'varchar', length: 100, nullable: true, name: 'course_name' })
	@Index()
	courseName: string | null

	@Column({ type: 'varchar', length: 100, nullable: true, name: 'semester' })
	semester: string | null

	@Column({ type: 'int', name: 'page_count', default: 0 })
	pageCount: number

	@Column({ type: 'enum', enum: EDocumentStatuses, default: EDocumentStatuses.PENDING })
	@Index()
	status: EDocumentStatuses

	@Column({ type: 'int', default: 0, name: 'number_views' })
	numberViews: number

	@ManyToOne(() => User, user => user.documents, {
		onDelete: 'SET NULL',
		nullable: true
	})
	@JoinColumn({ name: 'user_id' })
	user: User | null

	@OneToMany(() => Evaluation, evaluation => evaluation.document)
	evaluations: Evaluation[]

	@OneToMany(() => UnlockedDocument, unlockedDocument => unlockedDocument.document)
	unlockedDocuments: UnlockedDocument[]

	@OneToMany(() => Complaint, complaint => complaint.document)
	complaints: Complaint[]

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
	@Index()
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
	updatedAt: Date
}
