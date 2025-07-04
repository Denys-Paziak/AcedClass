import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOAuth2, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { Request, Response } from 'express'

import { GoogleAuthGuard } from '../../../guards/google-auth.guard'
import { ForgotPasswordDto } from '../dtos/ForgotPassword.dto'
import { LoginDto } from '../dtos/Login.dto'
import { RegistrationDto } from '../dtos/Registration.dto'
import { ResetPasswordDto } from '../dtos/ResetPassword.dto'
import { AuthService } from '../services/auth.service'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Recaptcha()
	@Post('signup')
	@ApiOperation({ summary: 'User registration' })
	@ApiResponse({ status: 201, description: 'User successfully registered' })
	@ApiResponse({ status: 403, description: 'User blocked' })
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
	@ApiOperation({ summary: 'Google Authorization' })
	@ApiOAuth2(['google'])
	@ApiResponse({ status: 200, description: 'Google Authentication Successful' })
	@ApiResponse({ status: 403, description: 'User is blocked' })
	@ApiResponse({ status: 409, description: 'User with this email is already registered' })
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

		response.redirect(this.configService.getOrThrow('GOOGLE_CALLBACK_FRONT_URL'))
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/login')
	@ApiOperation({ summary: 'Start the Google login process' })
	@ApiOAuth2(['google'])
	async googleLogin() {}

	@Recaptcha()
	@HttpCode(200)
	@Post('login-recaptcha')
	@ApiOperation({ summary: 'Login with recaptcha verification' })
	@ApiResponse({ status: 200, description: 'Successful login with recaptcha' })
	@ApiResponse({ status: 401, description: 'Invalid password or login' })
	@ApiResponse({ status: 403, description: 'User blocked' })
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
	@ApiOperation({ summary: 'User login' })
	@ApiResponse({ status: 200, description: 'Successful login' })
	@ApiResponse({ status: 401, description: 'Invalid password or login' })
	@ApiResponse({ status: 403, description: 'User is blocked' })
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
	@ApiOperation({ summary: 'Logout' })
	@ApiResponse({ status: 200, description: 'User logged out' })
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

	@HttpCode(200)
	@Patch('forgot-password')
	@ApiOperation({ summary: 'Password reset request' })
	@ApiResponse({ status: 200, description: 'Password reset link sent to email' })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.forgotPassword(dto)
	}

	@HttpCode(200)
	@Patch('reset-password')
	@ApiOperation({ summary: 'Reset password with token' })
	@ApiResponse({ status: 200, description: 'Password successfully changed' })
	@ApiResponse({ status: 400, description: 'Invalid token for password reset' })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto)
	}

	@Get('refresh')
	@ApiOperation({ summary: 'Update access and refresh tokens' })
	@ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
	@ApiResponse({ status: 401, description: 'Invalid refresh token' })
	@ApiResponse({ status: 403, description: 'User blocked' })
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
