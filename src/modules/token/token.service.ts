import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { minutes } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import { randomInt } from 'crypto'
import { FindOneOptions, Repository } from 'typeorm'
import { v4 as uuid } from 'uuid'

import { ITokenUser } from '../../interfaces/ITokenUser'

import { Token } from './entities/Token.entity'

@Injectable()
export class TokenService {
	constructor(
		@InjectRepository(Token)
		private readonly tokenRepository: Repository<Token>,

		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async addToken(token: Partial<Token>) {
		await this.tokenRepository.delete({ type: token.type, user: token.user })

		await this.tokenRepository.save(token)
	}

	async findOneAndCheck(options: FindOneOptions<Token>) {
		const tokenFromDB = await this.tokenRepository.findOne(options)
		if (!tokenFromDB) throw new BadRequestException('No such token or code was found or it is expired.')

		return tokenFromDB
	}

	async deleteToken(token: Token) {
		await this.tokenRepository.delete({ type: token.type, user: token.user })
	}

	generateRefreshToken(payload: ITokenUser) {
		return this.jwtService.signAsync(payload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY'),
			expiresIn: '30d'
		})
	}

	generateAccessToken(payload: ITokenUser) {
		return this.jwtService.signAsync(payload, {
			secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY'),
			expiresIn: '15m'
		})
	}

	async validateRefreshToken(refresh_token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(refresh_token, {
				secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY')
			})

			return payload
		} catch {
			throw new UnauthorizedException('The user is not authorized')
		}
	}

	generateForgotPasswordToken() {
		const token = uuid()
		const expiresIn = new Date(new Date().getTime() + 300000)

		return { token, expiresIn }
	}

	generateAdminVerificationCode() {
		const code = randomInt(100000, 1000000).toString()
		const expiresIn = new Date(new Date().getTime() + minutes(5))

		return { code, expiresIn }
	}

	validateToken(token: Token) {
		return new Date(token.expiresIn).getTime() > new Date().getTime()
	}
}
