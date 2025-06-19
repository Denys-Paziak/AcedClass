import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailService } from 'src/modules/mail/mail.service'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { Repository } from 'typeorm'

import { PostMessageDto } from '../dtos/PostMessage.dto'
import { PostMessageContactSupportDto } from '../dtos/PostMessageContactSupport.dto'
import { Message } from '../entities/Message.entity'

@Injectable()
export class MessageCommandService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,

		private readonly mailService: MailService,
		private readonly userSystemService: UserSystemService
	) {}

	async postMessage(userId: number, data: PostMessageDto) {
		await this.messageRepository.save({
			subject: data.subject,
			message: data.message,
			recipient: { id: data.recipientId },
			author: { id: userId }
		})
	}

	async postMessageContactSupport(userId: number, data: PostMessageContactSupportDto) {
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: userId } })

		await this.mailService.sendMessageContactSupport(userFromDB.email, data.subject, data.message)
	}

	async deleteMessage(messageId: number) {
		await this.messageRepository.delete(messageId)
	}
}
