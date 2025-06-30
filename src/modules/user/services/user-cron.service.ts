import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { WinstonLogger } from 'src/modules/logger/winston.logger'
import { Repository } from 'typeorm'

import { User } from '../entities/User.entity'

@Injectable()
export class UserCronService {
	private readonly logger = new WinstonLogger()

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_11PM)
	async resetLimitUpload() {
		this.logger.log('🕜 Cron job started: resetLimitUpload')

		try {
			const { affected } = await this.userRepository
				.createQueryBuilder()
				.update(User)
				.set({ availableUploads: () => '"daily_limit_uploads"' })
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
