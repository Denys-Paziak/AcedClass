import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

import { User } from '../entities/User.entity'

@Injectable()
export class UserSystemService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async findOneAndCheck(options: FindOneOptions<User>, error?: HttpException) {
		const userFromDB = await this.userRepository.findOne(options)
		if (!userFromDB) throw error || new NotFoundException('No such user found')

		return userFromDB
	}

	async count(options?: FindManyOptions<User> | undefined) {
		return await this.userRepository.count(options)
	}

	async find(options: FindOneOptions<User>) {
		return await this.userRepository.find(options)
	}

	async findOne(options: FindOneOptions<User>) {
		return await this.userRepository.findOne(options)
	}

	async createAndCheck(data: Partial<User>) {
		if (await this.userRepository.findOne({ where: { email: data.email, registrationType: data.registrationType } })) {
			throw new ConflictException('Such a user already exists')
		}

		await this.userRepository.save(data)

		return await this.findOneAndCheck({
			where: { email: data.email, registrationType: data.registrationType }
		})
	}

	async create(data: Partial<User>) {
		await this.userRepository.save(data)

		return await this.findOneAndCheck({
			where: { email: data.email, registrationType: data.registrationType }
		})
	}

	async uploadUnlocking(userId: User['id']) {
		await this.userRepository.update(userId, { uploadBlocking: null })
	}

	async decrementStrikeCounter(userId: User['id'], manager: EntityManager) {
		const repo = manager.getRepository(User)

		await repo
			.createQueryBuilder()
			.update(User)
			.set({ strikeCounter: () => `"strike_counter" - 1` })
			.where('id = :id', { id: userId })
			.andWhere('"strike_counter" IS NOT NULL')
			.execute()
	}

	async decrementAvailableUploads(userId: User['id'], manager: EntityManager) {
		const repo = manager.getRepository(User)

		await repo
			.createQueryBuilder()
			.update(User)
			.set({ availableUploads: () => `"available_uploads" - 1` })
			.where('id = :id', { id: userId })
			.andWhere('"available_uploads" > 0')
			.andWhere('"available_uploads" IS NOT NULL')
			.execute()
	}
}
