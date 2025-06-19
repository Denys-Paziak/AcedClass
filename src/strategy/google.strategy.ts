import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'
import { ITokenUser } from 'src/interfaces/ITokenUser'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
			clientSecret: configService.getOrThrow<string>('GOOGLE_SECRET'),
			callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
			scope: ['email', 'profile']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any) {
		return {
			email: profile.emails[0].value,
			firstName: profile.name.givenName,
			lastName: profile.name.familyName
		}
	}
}
