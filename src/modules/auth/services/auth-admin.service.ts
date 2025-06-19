import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ETokenTypes } from 'src/interfaces/ETokenTypes'

import { MailService } from '../../mail/mail.service'
import { TokenService } from '../../token/token.service'
import { LoginDto } from '../dtos/Login.dto'
import { SendCodeDto } from '../dtos/SendCode.dto'
import { UserSystemService } from 'src/modules/user/services/user-system.service'

@Injectable()
export class AuthAdminService {
	constructor(
		private readonly tokenService: TokenService,
		private readonly mailService: MailService,
		private readonly userSystemService: UserSystemService
	) {}

	async sendVerificationCode(dto: LoginDto) {
		const userFromDB = await this.userSystemService.findOneAndCheck(
			{
				where: {
					email: dto.email,
					role: ERoleNames.ADMIN
				},
				select: {
					id: true,
					role: true,
					password: true
				}
			},
			new UnauthorizedException('Incorrect login or password')
		)

		if (userFromDB.password && !(await bcrypt.compare(dto.password, userFromDB.password))) {
			throw new UnauthorizedException('Incorrect login or password')
		}

		const { code, expiresIn } = this.tokenService.generateAdminVerificationCode()

		await this.tokenService.addToken({
			tokenOrCode: code,
			type: ETokenTypes.ADMIN_VERIFICATION_CODE,
			expiresIn,
			user: userFromDB
		})
		
		await this.mailService.sendAdminVerificationCode(dto.email, code)
	}

	async login(dto: SendCodeDto) {
		const tokenFromDB = await this.tokenService.findOneAndCheck({
			where: { tokenOrCode: dto.code },
			relations: {
				user: true
			}
		})

		if (!this.tokenService.validateToken(tokenFromDB)) {
			throw new BadRequestException('No such token or code was found or it is expired.')
		}

		const refreshToken = await this.tokenService.generateRefreshToken({
			id: tokenFromDB.user.id,
			role: tokenFromDB.user.role
		})
		const accessToken = await this.tokenService.generateAccessToken({
			id: tokenFromDB.user.id,
			role: tokenFromDB.user.role
		})

		this.tokenService.deleteToken(tokenFromDB)

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
				role: ERoleNames.ADMIN
			}
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
}
