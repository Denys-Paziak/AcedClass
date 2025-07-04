import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { ERoleNames } from '../interfaces/ERoleNames'

import { Roles } from './roles.decorator'

export function Authorization(role: ERoleNames, ...roles: ERoleNames[]) {
	return applyDecorators(Roles(role, ...roles), UseGuards(JwtAuthGuard, RolesGuard))
}
