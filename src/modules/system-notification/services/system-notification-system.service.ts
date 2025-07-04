import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'

import { TSystemNotificationData } from '../../../interfaces/TSystemNotificationData'
import { SystemNotification } from '../entities/System-notification.entity'

@Injectable()
export class SystemNotificationSystemService {
	constructor(
		@InjectRepository(SystemNotification)
		private readonly systemNotification: Repository<SystemNotification>
	) {}

	async createSystemNotification(userId: number, data: TSystemNotificationData, manager?: EntityManager) {
		const repo = manager?.getRepository(SystemNotification) || this.systemNotification

		await repo.save({
			type: data.type,
			data: data,
			user: { id: userId }
		})
	}
}
