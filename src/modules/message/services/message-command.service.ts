import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MailService } from 'src/modules/mail/mail.service'
import { UserSystemService } from 'src/modules/user/services/user-system.service'
import { Repository } from 'typeorm'

import { AdminSendEmailToUsersDto } from '../dtos/AdminSendEmailToUsers.dto'
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
		const userFromDB = await this.userSystemService.findOneAndCheck({ where: { id: data.recipientId } })

		await this.messageRepository.save({
			subject: data.subject,
			message: data.message,
			recipient: userFromDB,
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

	async adminSendEmailToUsers(data: AdminSendEmailToUsersDto) {
		const usersEmails = (await this.userSystemService.find()).map(item => item.email)

		let sendTo: string[]

		if (data.sendTo) {
			const notFoundEmails: string[] = []

			data.sendTo.forEach(item => {
				if (!usersEmails.includes(item)) {
					notFoundEmails.push(item)
				}
			})

			if (notFoundEmails.length) {
				throw new NotFoundException(`Users with the following emails ${notFoundEmails.join(', ')} were not found`)
			}

			sendTo = data.sendTo
		} else {
			sendTo = usersEmails
		}

		await this.mailService.adminSendEmailToUsers(sendTo, data.subject, data.message)
	}
}
