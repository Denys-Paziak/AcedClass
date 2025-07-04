import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { GoogleStrategy } from '../../strategy/google.strategy'
import { JwtStrategy } from '../../strategy/jwt.strategy'
import { SystemSettingModule } from '../system-setting/system-setting.module'
import { TokenModule } from '../token/token.module'
import { UserModule } from '../user/user.module'

import { AuthAdminController } from './controllers/auth-admin.controller'
import { AuthController } from './controllers/auth.controller'
import { AuthAdminService } from './services/auth-admin.service'
import { AuthService } from './services/auth.service'

@Module({
	imports: [
		UserModule,
		TokenModule,
		PassportModule,
		SystemSettingModule,
	],
	controllers: [AuthController, AuthAdminController],
	providers: [AuthService, AuthAdminService, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
