import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'

import { Document } from '../entities/Document.entity'

@Injectable()
export class DocumentSystemService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepository: Repository<Document>
	) {}

	async count(options?: FindManyOptions<Document> | undefined) {
		return await this.documentRepository.count(options)
	}

	async findOne(options: FindOneOptions<Document>) {
		return await this.documentRepository.findOne(options)
	}

	async find(options?: FindManyOptions<Document> | undefined) {
		return await this.documentRepository.find(options)
	}

	async findOneAndCheck(options: FindOneOptions<Document>) {
		const documentFromDB = await this.documentRepository.findOne(options)
		if (!documentFromDB) throw new NotFoundException('No such document found.')

		return documentFromDB
	}
}
