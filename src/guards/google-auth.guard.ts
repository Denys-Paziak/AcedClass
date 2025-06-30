import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { WinstonLogger } from 'src/modules/logger/winston.logger'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
	private readonly logger = new WinstonLogger()

	handleRequest(err, user, info, context: ExecutionContext) {
		if (err || !user) {
			const req = context.switchToHttp().getRequest()

			this.logger.warn(`⚠️ Warn: ${req.method} ${req.originalUrl} [${401}] `, 'Error: Unauthorized (Google OAuth)')
			throw err || new UnauthorizedException()
		}
		return user
	}
}
