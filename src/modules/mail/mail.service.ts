import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { Token } from '../token/entities/Token.entity'

import { AdminAlertTemplate } from './templates/AdminAlert.template'
import { AdminSendEmailToUsersTemplate } from './templates/AdminSendEmailToUsers.template'
import { AdminVerificationCodeTemplate } from './templates/AdminVerificationCode.template'
import { ForgotPasswordTemplate } from './templates/ForgotPassword.template'
import { MessageContactSupportTemplate } from './templates/MessageContactSupport.template'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendEmailForgotPassword(email: string, token: Token['tokenOrCode']) {
		try {
			await this.mailerService.sendMail({
				to: email,
				subject: '',
				html: await render(
					ForgotPasswordTemplate({
						link: this.configService.getOrThrow('FORGOT_PASSWORD_FRONT_URL') + token
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send a password reset email.')
		}
	}

	async sendAdminVerificationCode(email: string, code: Token['tokenOrCode']) {
		try {
			await this.mailerService.sendMail({
				to: email,
				subject: '',
				html: await render(
					AdminVerificationCodeTemplate({
						code
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send an email with a verification code.')
		}
	}

	async sendMessageContactSupport(userEmail: string, subject: string, message: string) {
		try {
			await this.mailerService.sendMail({
				to: this.configService.getOrThrow<string>('MAIL_SUPPORT'),
				html: await render(
					MessageContactSupportTemplate({
						subject,
						message,
						userEmail
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send an email to the support team.')
		}
	}

	async adminAlert(documentPending: number, adminNotificationRecipients: string[]) {
		try {
			await this.mailerService.sendMail({
				to: adminNotificationRecipients,
				html: await render(
					AdminAlertTemplate({
						documentPending
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send an email to the admins.')
		}
	}

	async adminSendEmailToUsers(userEmails: string[], subject: string, message: string) {
		try {
			await this.mailerService.sendMail({
				to: userEmails,
				html: await render(
					AdminSendEmailToUsersTemplate({
						subject,
						message
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send an email to the specified emails.')
		}
	}
}
