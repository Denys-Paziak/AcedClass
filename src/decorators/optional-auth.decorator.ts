import { applyDecorators, UseGuards } from '@nestjs/common'
import { OptionalAuthGuard } from 'src/guards/optional-auth.guard'

export function OptionalAuth() {
	return applyDecorators(UseGuards(OptionalAuthGuard))
}
