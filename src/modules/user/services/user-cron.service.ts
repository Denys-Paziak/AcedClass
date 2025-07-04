import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { WinstonLogger } from '../../../modules/logger/winston.logger'
import { User } from '../entities/User.entity'

@Injectable()
export class UserCronService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		private readonly logger: WinstonLogger
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_11PM)
	async resetLimitUpload() {
		this.logger.log('🕜 Cron job started: resetLimitUpload')

		try {
			const { affected } = await this.userRepository
				.createQueryBuilder()
				.update(User)
				.set({ dailyCountUploads: 0 })
				.execute()

			this.logger.log(`🕜 Cron job completed: resetLimitUpload`, `${affected} users updated`)
		} catch (error) {
			this.logger.error(
				'🕜 Cron job failed: resetLimitUpload',
				error.stack,
				`Error: ${JSON.stringify(error.message || error)}`
			)
		}
	}
}
