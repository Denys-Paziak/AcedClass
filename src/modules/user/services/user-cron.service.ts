import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '../entities/User.entity'

@Injectable()
export class UserCronService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_11PM)
	async resetLimitUpload() {
		await this.userRepository
			.createQueryBuilder()
			.update(User)
			.set({ availableUploads: () => '"daily_limit_uploads"' })
			.execute()
	}
}
