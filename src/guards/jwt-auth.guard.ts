import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { WinstonLogger } from '../modules/logger/winston.logger'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	private readonly logger = new WinstonLogger()

	handleRequest(err, user, info, context: ExecutionContext) {
		if (err || !user) {
			const req = context.switchToHttp().getRequest()
			
			this.logger.warn(
				`⚠️ Warn: ${req.method} ${req.originalUrl} [${401}] `,
				'Error: Unauthorized'
			)
			throw err || new UnauthorizedException()
		}
		return user
	}
}
