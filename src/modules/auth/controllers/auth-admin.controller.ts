import { Body, Controller, Get, HttpCode, InternalServerErrorException, Post, Req, Res } from '@nestjs/common'
import { minutes, Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { ThrottleMessage } from 'src/decorators/throttle-message.decorator'

import { LoginDto } from '../dtos/Login.dto'
import { SendCodeDto } from '../dtos/SendCode.dto'
import { AuthAdminService } from '../services/auth-admin.service'
import { ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Authentication Admin')
@Controller('admin/auth')
export class AuthAdminController {
	constructor(private readonly authAdminService: AuthAdminService) {}

	@HttpCode(200)
	@Post('send-code')
	@ApiOperation({ summary: 'Надсилання коду підтвердження адміністратору' })
	@ApiResponse({ status: 200, description: 'Код успішно надіслано' })
	@ApiResponse({ status: 401, description: 'Неправильно введений пароль або логін' })
	async sendVerificationCode(@Body() dto: LoginDto) {
		return await this.authAdminService.sendVerificationCode(dto)
	}

	@Throttle({ default: { limit: 5, ttl: minutes(10) } })
	@ThrottleMessage('Too many login attempts. Please try again later.')
	@HttpCode(200)
	@Post('login')
	@ApiOperation({ summary: 'Вхід адміністратора за допомогою коду' })
	@ApiResponse({ status: 200, description: 'Успішний вхід адміністратора' })
	@ApiResponse({ status: 400, description: 'Недійсний код для входу' })
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
	@ApiOperation({ summary: 'Вихід з акаунту адміністратора' })
	@ApiResponse({ status: 200, description: 'Адміністратора розлогінено' })
	async logout(@Res({ passthrough: true }) response: Response) {
		try {
			response.clearCookie('refresh_token')
			response.clearCookie('access_token')
		} catch (error) {
			throw new InternalServerErrorException('Unexpected error.')
		}
	}

	@Get('refresh')
	@ApiOperation({ summary: 'Оновлення access та refresh токенів' })
	@ApiResponse({ status: 200, description: 'Токени оновлено успішно' })
	@ApiResponse({ status: 401, description: 'Недійсний refresh токен' })
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
