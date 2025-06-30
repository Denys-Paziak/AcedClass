import { Body, Controller, Delete, Get, InternalServerErrorException, Patch, Req, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
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
	@ApiOperation({ summary: 'Get user information' })
	@ApiResponse({
		status: 200,
		type: GetSelfResponse,
		description: 'Get user information'
	})
	async getSelf(@Req() request: Request): Promise<GetSelfResponse> {
		const userFromToken = request.user as ITokenUser

		return await this.userQueryService.getSelf(userFromToken.id, userFromToken.role)
	}

	@Authorization(ERoleNames.USER)
	@Patch('info')
	@ApiOperation({ summary: 'Update user information' })
	@ApiResponse({
		status: 200,
		description: 'User information successfully updated',
		type: UpdateUserInfoDto
	})
	@ApiResponse({
		status: 404,
		description: 'User not found'
	})
	async updateInfo(@Req() request: Request, @Body() dto: UpdateUserInfoDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateInfoAndCheck(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Patch('email')
	@ApiOperation({ summary: 'Update user information and email' })
	@ApiResponse({
		status: 200,
		description: 'User information and email successfully updated',
		type: UpdateUserInfoAndEmailDto
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid password'
	})
	@ApiResponse({
		status: 404,
		description: 'User not found'
	})
	async updateInfoAndEmail(@Req() request: Request, @Body() dto: UpdateUserInfoAndEmailDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateInfoAndEmailAndCheck(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Patch('notification-preferences')
	@ApiOperation({ summary: 'Update user notification preferences' })
	@ApiResponse({
		status: 200,
		description: 'User notification preferences successfully updated',
		type: UpdateNotificationPreferencesDto
	})
	@ApiResponse({
		status: 404,
		description: 'User not found'
	})
	async updateNotificationPreferences(@Req() request: Request, @Body() dto: UpdateNotificationPreferencesDto) {
		const userFromToken = request.user as ITokenUser

		await this.userCommandService.updateNotificationPreferences(userFromToken.id, dto)
	}

	@Authorization(ERoleNames.USER)
	@Delete('/')
	@ApiOperation({ summary: 'Delete user' })
	@ApiResponse({
		status: 204,
		description: 'User successfully deleted'
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
