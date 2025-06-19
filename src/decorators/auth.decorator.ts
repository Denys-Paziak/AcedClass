import { applyDecorators, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from 'src/guards/roles.guard'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { Roles } from './roles.decorator'

export function Authorization(role: ERoleNames, ...roles: ERoleNames[]) {
	return applyDecorators(
		Roles(role, ...roles),
		UseGuards(AuthGuard('jwt'), RolesGuard)
	)
}
