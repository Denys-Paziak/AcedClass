import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { minutes, Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { ThrottleMessage } from '../../../decorators/throttle-message.decorator'

import { LoginDto } from '../dtos/Login.dto'
import { SendCodeDto } from '../dtos/SendCode.dto'
import { AuthAdminService } from '../services/auth-admin.service'

@ApiTags('Authentication Admin')
@Controller('admin/auth')
export class AuthAdminController {
	constructor(private readonly authAdminService: AuthAdminService) {}

	@HttpCode(200)
	@Post('send-code')
	@ApiOperation({ summary: 'Sending a verification code to the administrator' })
	@ApiResponse({ status: 200, description: 'Code sent successfully' })
	@ApiResponse({ status: 401, description: 'Password or login entered incorrectly' })
	async sendVerificationCode(@Body() dto: LoginDto) {
		return await this.authAdminService.sendVerificationCode(dto)
	}

	@Throttle({ default: { limit: 5, ttl: minutes(10) } })
	@ThrottleMessage('Too many login attempts. Please try again later.')
	@HttpCode(200)
	@Post('login')
	@ApiOperation({ summary: 'Administrator login with a code' })
	@ApiResponse({ status: 200, description: 'Successful administrator login' })
	@ApiResponse({ status: 400, description: 'Invalid login code' })
	async login(@Body() dto: SendCodeDto, @Res({ passthrough: true }) response: Response) {
		const data = await this.authAdminService.login(dto)

		response.cookie('refresh_token', data.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
		response.cookie('access_token', data.accessToken, {
			maxAge: 30 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
	}

	@HttpCode(200)
	@Post('logout')
	@ApiOperation({ summary: 'Log out of the administrator account' })
	@ApiResponse({ status: 200, description: 'Log out success' })
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('refresh_token', {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
		response.clearCookie('access_token', {
			maxAge: 30 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
	}

	@Get('refresh')
	@ApiOperation({ summary: 'Update access and refresh tokens' })
	@ApiResponse({ status: 200, description: 'Tokens updated successfully' })
	@ApiResponse({ status: 401, description: 'Invalid refresh token' })
	async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		const refresh_token = request.cookies['refresh_token']

		const data = await this.authAdminService.refreshToken(refresh_token)

		response.cookie('refresh_token', data.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
		response.cookie('access_token', data.accessToken, {
			maxAge: 30 * 60 * 1000,
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/'
		})
	}
}
