import { SetMetadata } from '@nestjs/common'
import { ERoleNames } from '../interfaces/ERoleNames'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: ERoleNames[]) => SetMetadata(ROLES_KEY, roles)
