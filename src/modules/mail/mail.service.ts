import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { Token } from '../token/entities/Token.entity'
import { User } from '../user/entities/User.entity'

import { AdminVerificationCodeTemplate } from './templates/AdminVerificationCode.template'
import { ForgotPasswordTemplate } from './templates/ForgotPassword.template'
import { MessageContactSupportTemplate } from './templates/MessageContactSupport.template'

@Injectable()
export class MailService {
	constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async sendEmailForgotPassword(email: User['email'], token: Token['tokenOrCode']) {
		try {
			await this.mailerService.sendMail({
				to: email,
				subject: '',
				html: await render(
					ForgotPasswordTemplate({
						link: 'http://localhost:3000/auth/forgot-password/' + token
					})
				)
			})
		} catch {
			throw new InternalServerErrorException('For some reason, we were unable to send a password reset email.')
		}
	}

	async sendAdminVerificationCode(email: User['email'], code: Token['tokenOrCode']) {
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

	async sendMessageContactSupport(userEmail: User['email'], subject: string, message: string) {
		try {
			await this.mailerService.sendMail({
				to: this.configService.getOrThrow<string>('MAIL_SUPPORT'),
				from: this.configService.getOrThrow<string>('MAIL_NO-REPLY'),
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
}
