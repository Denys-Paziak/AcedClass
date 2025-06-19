import { Body, Controller, Get, HttpCode, InternalServerErrorException, Patch, Post, Req, Res, UseGuards } from '@nestjs/common'
import {  ApiOAuth2, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { Request, Response } from 'express'
import { GoogleAuthGuard } from 'src/guards/google-auth.guard'

import { ForgotPasswordDto } from '../dtos/ForgotPassword.dto'
import { LoginDto } from '../dtos/Login.dto'
import { RegistrationDto } from '../dtos/Registration.dto'
import { ResetPasswordDto } from '../dtos/ResetPassword.dto'
import { AuthService } from '../services/auth.service'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Recaptcha()
	@Post('signup')
	@ApiOperation({ summary: 'Реєстрація користувача' })
	@ApiResponse({ status: 201, description: 'Користувача успішно зареєстровано' })
	@ApiResponse({ status: 403, description: 'Користувач заблокований' })
	async registration(@Body() dto: RegistrationDto, @Res({ passthrough: true }) response: Response) {
		const data = await this.authService.register(dto)

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

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	@ApiOperation({ summary: 'Авторизація через Google' })
	@ApiOAuth2(['google'])
	@ApiResponse({ status: 200, description: 'Авторизація через Google успішна' })
	@ApiResponse({ status: 403, description: 'Користувач заблокований' })
	@ApiResponse({ status: 409, description: 'Користувач з такою поштою уже зареєстрований' })
	async googleCallback(@Req() request: Request, @Res() response: Response) {
		const userFromGoogle = request.user as {
			email: string
			firstName: string
			lastName: string
		}

		const data = await this.authService.googleLogin(userFromGoogle)

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

		response.redirect(`http://localhost:3000/auth/success`)
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/login')
	@ApiOperation({ summary: 'Запуск процесу логіну через Google' })
	@ApiOAuth2(['google'])
	async googleLogin() {}

	@Recaptcha()
	@HttpCode(200)
	@Post('login-recaptcha')
	@ApiOperation({ summary: 'Логін з перевіркою recaptcha' })
	@ApiResponse({ status: 200, description: 'Успішний вхід з recaptcha' })
	@ApiResponse({ status: 401, description: 'Неправильно введений пароль або логін' })
	@ApiResponse({ status: 403, description: 'Користувач заблокований' })
	async loginRecaptcha(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const data = await this.authService.login(dto)

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
	@Post('login')
	@ApiOperation({ summary: 'Звичайний логін користувача' })
	@ApiResponse({ status: 200, description: 'Успішний вхід' })
	@ApiResponse({ status: 401, description: 'Неправильно введений пароль або логін' })
	@ApiResponse({ status: 403, description: 'Користувач заблокований' })
	async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
		const data = await this.authService.login(dto)

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
	@ApiOperation({ summary: 'Вихід з акаунту' })
	@ApiResponse({ status: 200, description: 'Користувача розлогінено' })
	async logout(@Res({ passthrough: true }) response: Response) {
		try {
			response.clearCookie('refresh_token')
			response.clearCookie('access_token')
		} catch (error) {
			throw new InternalServerErrorException('Unexpected error.')
		}
	}

	@HttpCode(200)
	@Patch('forgot-password')
	@ApiOperation({ summary: 'Запит на скидання пароля' })
	@ApiResponse({ status: 200, description: 'Посилання на скидання пароля надіслано на email' })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto)
	}

	@HttpCode(200)
	@Patch('reset-password')
	@ApiOperation({ summary: 'Скидання пароля за допомогою токена' })
	@ApiResponse({ status: 200, description: 'Пароль успішно змінено' })
	@ApiResponse({ status: 400, description: 'Недійсний токен для скидування паролю' })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto)
	}

	@Get('refresh')
	@ApiOperation({ summary: 'Оновлення access та refresh токенів' })
	@ApiResponse({ status: 200, description: 'Токени оновлено успішно' })
	@ApiResponse({ status: 401, description: 'Недійсний refresh токен' })
	@ApiResponse({ status: 403, description: 'Користувач заблокований' })
	async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
		const refresh_token = request.cookies['refresh_token']

		const data = await this.authService.refreshToken(refresh_token)
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
