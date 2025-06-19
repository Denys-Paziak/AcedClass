import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'

import { Message } from '../entities/Message.entity'
import { GetMyMessagesResponse } from '../responses/GetMyMessages.response'

@Injectable()
export class MessageQueryService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>
	) {}

	async getMyMessages(userId: number) {
		const result = await this.messageRepository.find({ where: { id: userId } })

		return plainToInstance(GetMyMessagesResponse, result, {
			excludeExtraneousValues: true
		})
	}
}
