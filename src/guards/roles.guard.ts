import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<ERoleNames[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])

		if (!requiredRoles) {
			return true
		}

		const payload = context.switchToHttp().getRequest().user

		if (!payload) {
			throw new UnauthorizedException('The user is not authorized')
		}

		if (!requiredRoles.includes(payload.role)) {
			throw new ForbiddenException('Insufficient permissions to access this resource')
		}

		return true
	}
}
