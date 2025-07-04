import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ITokenUser } from '../interfaces/ITokenUser'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request): string | null => {
					return req?.cookies?.access_token ?? null
				}
			]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET_KEY')
		})
	}

	async validate(payload: ITokenUser) {
		return payload
	}
}
