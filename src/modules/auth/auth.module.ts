import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha'
import { getGoogleRecaptchaConfig } from 'src/configs/recaptcha.config'
import { GoogleStrategy } from 'src/strategy/google.strategy'

import { JwtStrategy } from '../../strategy/jwt.strategy'
import { TokenModule } from '../token/token.module'
import { UserModule } from '../user/user.module'

import { AuthAdminController } from './controllers/auth-admin.controller'
import { AuthController } from './controllers/auth.controller'
import { AuthAdminService } from './services/auth-admin.service'
import { AuthService } from './services/auth.service'

@Module({
	imports: [UserModule, TokenModule, PassportModule, GoogleRecaptchaModule.forRootAsync(getGoogleRecaptchaConfig())],
	controllers: [AuthController, AuthAdminController],
	providers: [AuthService, AuthAdminService, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
