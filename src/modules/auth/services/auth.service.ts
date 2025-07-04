import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { ERegistrationTypes } from '../../../interfaces/ERegistrationTypes'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ETokenTypes } from '../../../interfaces/ETokenTypes'
import { SystemSettingQueryService } from '../../../modules/system-setting/services/system-setting-query.service'
import { UserCommandService } from '../../../modules/user/services/user-command.service'
import { UserSystemService } from '../../../modules/user/services/user-system.service'
import { generateRandomSuffix } from '../../../utils/generate-random-suffix.util'
import { MailService } from '../../mail/mail.service'
import { TokenService } from '../../token/token.service'
import { ForgotPasswordDto } from '../dtos/ForgotPassword.dto'
import { LoginDto } from '../dtos/Login.dto'
import { RegistrationDto } from '../dtos/Registration.dto'
import { ResetPasswordDto } from '../dtos/ResetPassword.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly tokenService: TokenService,
		private readonly mailService: MailService,
		private readonly userSystemService: UserSystemService,
		private readonly userCommandService: UserCommandService,
		private readonly systemSettingQueryService: SystemSettingQueryService
	) {}

	async register(data: RegistrationDto) {
		const salt = await bcrypt.genSalt(10)

		const hashPassword = await bcrypt.hash(data.password, salt)

		const normalizeBaseusername = data.email
			.split('@')[0]
			.slice(0, 45)
			.replace(/[^a-zA-Z0-9]/g, '_')
			.toLowerCase()

		let username: string = normalizeBaseusername + '_' + generateRandomSuffix()

		const checkExists = async () => {
			if (await this.userSystemService.findOne({ where: { username } })) {
				username = normalizeBaseusername + '_' + generateRandomSuffix()
				checkExists()
			}
		}
		await checkExists()

		let existsUser = await this.userSystemService.findOne({
			where: { email: data.email }
		})

		if (existsUser && existsUser.accountBlocking && existsUser.accountBlocking > new Date()) {
			throw new ForbiddenException(existsUser.reasonBlocking || 'Your account has been banned.')
		}

		const { limit } = (await this.systemSettingQueryService.getSettings(['daily limit uploads']))('daily limit uploads')

		const userFromDB = await this.userSystemService.createAndCheck({
			email: data.email,
			password: hashPassword,
			role: ERoleNames.USER,
			registrationType: ERegistrationTypes.PASSWORD,
			username,
			dailyLimitUploads: limit
		})

		const refreshToken = await this.tokenService.generateRefreshToken({
			id: userFromDB.id,
			role: userFromDB.role
		})
		const accessToken = await this.tokenService.generateAccessToken({
			id: userFromDB.id,
			role: userFromDB.role
		})

		return {
			accessToken,
			refreshToken
		}
	}

	async googleLogin(data: { email: string; firstName: string; lastName: string }) {
		const normalizeBaseUsername = data.email
			.split('@')[0]
			.slice(0, 45)
			.replace(/[^a-zA-Z0-9]/g, '_')
			.toLowerCase()

		let username: string = normalizeBaseUsername + '_' + generateRandomSuffix()

		const checkExists = async () => {
			if (await this.userSystemService.findOne({ where: { username } })) {
				username = normalizeBaseUsername + '_' + generateRandomSuffix()
				checkExists()
			}
		}
		await checkExists()

		let user = await this.userSystemService.findOne({
			where: { email: data.email }
		})

		if (user && user.accountBlocking && user.accountBlocking > new Date()) {
			throw new ForbiddenException(user.reasonBlocking || 'Your account has been banned.')
		}

		if (!user || user.registrationType !== ERegistrationTypes.GOOGLE) {
			user = await this.userSystemService.create({
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				role: ERoleNames.USER,
				registrationType: ERegistrationTypes.GOOGLE,
				username
			})
		}

		const refreshToken = await this.tokenService.generateRefreshToken({
			id: user.id,
			role: user.role
		})
		const accessToken = await this.tokenService.generateAccessToken({
			id: user.id,
			role: user.role
		})

		return {
			accessToken,
			refreshToken
		}
	}

	async login(dto: LoginDto) {
		const userFromDB = await this.userSystemService.findOneAndCheck(
			{
				where: {
					role: ERoleNames.USER,
					email: dto.email,
					registrationType: ERegistrationTypes.PASSWORD
				},
				select: {
					id: true,
					role: true,
					password: true,
					accountBlocking: true
				}
			},
			new UnauthorizedException('Incorrect login or password')
		)

		if (userFromDB.accountBlocking && userFromDB.accountBlocking > new Date()) {
			throw new ForbiddenException(userFromDB.reasonBlocking || 'Your account has been banned.')
		}

		if (userFromDB.password && !(await bcrypt.compare(dto.password, userFromDB.password))) {
			throw new UnauthorizedException('Incorrect login or password')
		}

		const refreshToken = await this.tokenService.generateRefreshToken({
			id: userFromDB.id,
			role: userFromDB.role
		})
		const accessToken = await this.tokenService.generateAccessToken({
			id: userFromDB.id,
			role: userFromDB.role
		})

		return {
			accessToken,
			refreshToken
		}
	}

	async refreshToken(refresh_token: string | undefined) {
		if (!refresh_token) {
			throw new UnauthorizedException('The user is not authorized')
		}

		const userFromToken = await this.tokenService.validateRefreshToken(refresh_token)
		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: {
				id: userFromToken.id,
				role: ERoleNames.USER
			}
		})

		if (userFromDB.accountBlocking && userFromDB.accountBlocking > new Date()) {
			throw new ForbiddenException(userFromDB.reasonBlocking || 'Your account has been banned.')
		}

		const refreshToken = await this.tokenService.generateRefreshToken({
			id: userFromDB.id,
			role: userFromDB.role
		})
		const accessToken = await this.tokenService.generateAccessToken({
			id: userFromDB.id,
			role: userFromDB.role
		})

		return {
			accessToken,
			refreshToken
		}
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const { token, expiresIn } = this.tokenService.generateForgotPasswordToken()

		const userFromDB = await this.userSystemService.findOneAndCheck({
			where: { email: dto.email, role: ERoleNames.USER }
		})

		await this.mailService.sendEmailForgotPassword(dto.email, token)

		this.tokenService.addToken({
			tokenOrCode: token,
			type: ETokenTypes.RESET_PASSWORD,
			expiresIn,
			user: userFromDB
		})
	}

	async resetPassword(dto: ResetPasswordDto) {
		const tokenFromDB = await this.tokenService.findOneAndCheck({
			where: { tokenOrCode: dto.token },
			relations: {
				user: true
			}
		})

		if (this.tokenService.validateToken(tokenFromDB)) {
			const { user } = tokenFromDB

			const salt = await bcrypt.genSalt(10)

			const hashPassword = await bcrypt.hash(dto.password, salt)

			this.tokenService.deleteToken(tokenFromDB)
			this.userCommandService.updatePasswordAndCheck(user.id, hashPassword)
		} else {
			throw new BadRequestException('No such token or code was found or it is expired.')
		}
	}
}
