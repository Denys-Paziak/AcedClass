import { Body, Controller, Put } from '@nestjs/common'
import {  ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Authorization } from 'src/decorators/auth.decorator'
import { EPointTypes } from 'src/interfaces/EPointTypes'
import { ERoleNames } from 'src/interfaces/ERoleNames'

import { AppointmentPointsDto } from '../dtos/AppointmentPoints.dto'
import { PointCommandService } from '../services/point-command.service'

@ApiCookieAuth()
@ApiTags('Points Admin')
@Controller('admin/points')
export class PointAdminController {
	constructor(private readonly pointCommandService: PointCommandService) {}

	@Authorization(ERoleNames.ADMIN)
	@Put('appointment-points')
	@ApiOperation({ summary: 'Призначити або списати бали користувачу' })
	@ApiResponse({ status: 200, description: 'Бали успішно призначено або списано' })
	@ApiResponse({ status: 400, description: 'У користувача недостатньо балів для списання' })
	async appointmentPoints(@Body() dto: AppointmentPointsDto) {
		if (dto.ammount > 0) {
			await this.pointCommandService.addPoints(dto.userId, dto.ammount, { type: 'admin' })
		} else if (dto.ammount < 0) {
			await this.pointCommandService.writeOffPoints({
				userId: dto.userId,
				quantityPoint: dto.ammount,
				pointType: EPointTypes.POINT
			})
		}
	}
}
