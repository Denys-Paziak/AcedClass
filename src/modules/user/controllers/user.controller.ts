import { Body, Controller, Delete, Get, InternalServerErrorException, Patch, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, OmitType } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { UpdateNotificationPreferencesDto } from '../dtos/UpdateNotificationPreferences.dto'
import { UpdateUserInfoDto } from '../dtos/UpdateUserInfo.dto'
import { UpdateUserInfoAndEmailDto } from '../dtos/UpdateUserInfoAndEmail.dto'
import { GetSelfResponse } from '../responses/GetSelf.response'
import { UserCommandService } from '../services/user-command.service'
import { UserQueryService } from '../services/user-query.service'

@ApiCookieAuth()
@ApiTags('Users')
@Controller('users/self')
export class UserController {
	constructor(
		private readonly userQueryService: UserQueryService,
		private readonly userCommandService: UserCommandService
	) {}

	@Authorization(ERoleNames.USER)
	@Get('/')
	@ApiOperation({ summary: 'Отримати інформацію про користувача' })
	@ApiResponse({
		status: 200,
		type: GetSelfResponse,
		description: 'Отримати інформацію про користувача'
	})
	async getSelf(@Req() request: Request): Promise<GetSelfResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.userQueryService.getSelf(userFromToken.id, userFromToken.role)
	}

	@Authorization(ERoleNames.USER)
	@Patch('info')
	@ApiOperation({ summary: 'Оновити інформацію про користувача' })
	@ApiResponse({
		status: 200,
		description: 'Інформація про користувача успішно оновлена',
		type: UpdateUserInfoDto
	})
	@ApiResponse({
		status: 404,
		description: 'Користувача не знайдено'
	})
	async updateInfo(@Req() request: Request, @Body() dto: UpdateUserInfoDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateInfoAndCheck(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Patch('email')
	@ApiOperation({ summary: 'Оновити інформацію та email користувача' })
	@ApiResponse({
		status: 200,
		description: 'Інформація та email користувача успішно оновлені',
		type: UpdateUserInfoAndEmailDto
	})
	@ApiResponse({
		status: 400,
		description: 'Невірний пароль'
	})
	@ApiResponse({
		status: 404,
		description: 'Користувача не знайдено'
	})
	async updateInfoAndEmail(@Req() request: Request, @Body() dto: UpdateUserInfoAndEmailDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateInfoAndEmailAndCheck(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Patch('notification-preferences')
	@ApiOperation({ summary: 'Оновити налаштування сповіщень користувача' })
	@ApiResponse({
		status: 200,
		description: 'Налаштування сповіщень користувача успішно оновлені',
		type: UpdateNotificationPreferencesDto
	})
	@ApiResponse({
		status: 404,
		description: 'Користувача не знайдено'
	})
	async updateNotificationPreferences(@Req() request: Request, @Body() dto: UpdateNotificationPreferencesDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateNotificationPreferences(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Delete('/')
	@ApiOperation({ summary: 'Видалити користувача' })
	@ApiResponse({
		status: 204,
		description: 'Користувач успішно видалений'
	})
	async deleteUser(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.delete(userFromToken.id)

		try {
			response.clearCookie('refresh_token')
			response.clearCookie('access_token')
		} catch (error) {
			throw new InternalServerErrorException('Unexpected error.')
		}
	}
}
