import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'

import { SystemNotification } from '../entities/System-notification.entity'
import { GetMySystemNotificationResponse } from '../responses/GetMySystemNotification.response'

@Injectable()
export class SystemNotificationQueryService {
	constructor(
		@InjectRepository(SystemNotification)
		private readonly complaintRepository: Repository<SystemNotification>
	) {}

	async getMySystemNotification(userId: number) {
		const result = await this.complaintRepository.find({ where: { user: { id: userId } } })

		return plainToInstance(GetMySystemNotificationResponse, result, {
			excludeExtraneousValues: true
		})
	}
}
