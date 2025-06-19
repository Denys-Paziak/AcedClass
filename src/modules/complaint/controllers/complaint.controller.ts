import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { hours, Throttle } from '@nestjs/throttler'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { Request } from 'express'
import { Authorization } from 'src/decorators/auth.decorator'
import { ThrottleMessage } from 'src/decorators/throttle-message.decorator'
import { ERoleNames } from 'src/interfaces/ERoleNames'
import { ITokenUser } from 'src/interfaces/ITokenUser'

import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { ComplaintCommandService } from '../services/complaint-command.service'

@ApiCookieAuth()
@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
	constructor(private readonly complaintCommandService: ComplaintCommandService) {}

	@Throttle({ default: { limit: 5, ttl: hours(24) } })
	@ThrottleMessage('You have reached your complaint limit for today.')
	@Authorization(ERoleNames.USER)
	@Recaptcha()
	@Post('/')
	@ApiOperation({ summary: 'Подати скаргу' })
	@ApiResponse({
		status: 201,
		description: 'Скарга успішно подана'
	})
	async postComplaint(@Req() request: Request, @Body() dto: PostComplaintDto) {
		const userFromToken = request.user as ITokenUser

		await this.complaintCommandService.postComplaint(userFromToken.id, userFromToken.role, dto)
	}
}
