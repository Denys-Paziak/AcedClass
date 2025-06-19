import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module'

import { Token } from './entities/Token.entity'
import { TokenService } from './token.service'

@Module({
	imports: [JwtModule, UserModule, TypeOrmModule.forFeature([Token])],
	providers: [TokenService],
	exports: [TokenService]
})
export class TokenModule {}
