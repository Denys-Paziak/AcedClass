import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Recaptcha } from '@nestlab/google-recaptcha'
import { Request } from 'express'

import { Authorization } from '../../../decorators/auth.decorator'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { ITokenUser } from '../../../interfaces/ITokenUser'
import { PostComplaintDto } from '../dtos/PostComplaint.dto'
import { ComplaintCommandService } from '../services/complaint-command.service'

@ApiCookieAuth()
@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
	constructor(private readonly complaintCommandService: ComplaintCommandService) {}

	//@Recaptcha()
	@Authorization(ERoleNames.USER)
	@Post('/')
	@ApiOperation({ summary: 'File a complaint' })
	@ApiResponse({
		status: 201,
		description: 'Complaint successfully filed'
	})
	async postComplaint(@Req() request: Request, @Body() dto: PostComplaintDto) {
		const userFromToken = request.user as ITokenUser

		await this.complaintCommandService.postComplaint(userFromToken.id, userFromToken.role, dto)
	}
}
