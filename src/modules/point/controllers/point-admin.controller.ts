import { Body, Controller, Patch } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Authorization } from '../../../decorators/auth.decorator'
import { EPointTypes } from '../../../interfaces/EPointTypes'
import { ERoleNames } from '../../../interfaces/ERoleNames'
import { AppointmentPointsDto } from '../dtos/AppointmentPoints.dto'
import { PointCommandService } from '../services/point-command.service'

@ApiCookieAuth()
@ApiTags('Points Admin')
@Controller('admin/points')
export class PointAdminController {
	constructor(private readonly pointCommandService: PointCommandService) {}

	@Authorization(ERoleNames.ADMIN)
	@Patch('appointment-points')
	@ApiOperation({ summary: 'Assign or deduct points to/from a user' })
	@ApiResponse({ status: 200, description: 'Points successfully assigned or deducted' })
	@ApiResponse({ status: 400, description: 'User does not have enough points for deduction' })
	async appointmentPoints(@Body() dto: AppointmentPointsDto) {
		if (dto.ammount > 0) {
			await this.pointCommandService.addPoints(dto.userId, dto.ammount, { type: 'admin' })
		} else if (dto.ammount < 0) {
			await this.pointCommandService.writeOffPoints({
				userId: dto.userId,
				quantityPoint: Math.abs(dto.ammount),
				pointType: EPointTypes.POINT
			})
		}
	}

	@Authorization(ERoleNames.ADMIN)
	@Patch('appointment-reveals')
	@ApiOperation({ summary: 'Assign or deduct reveals to/from a user' })
	@ApiResponse({ status: 200, description: 'Reveals successfully assigned or deducted' })
	@ApiResponse({ status: 400, description: 'User does not have enough reveals for deduction' })
	async appointmentReveals(@Body() dto: AppointmentPointsDto) {
		if (dto.ammount > 0) {
			await this.pointCommandService.addReveals({ id: dto.userId }, dto.ammount, { type: 'admin' })
		} else if (dto.ammount < 0) {
			await this.pointCommandService.writeOffPoints({
				userId: dto.userId,
				quantityPoint: Math.abs(dto.ammount),
				pointType: EPointTypes.REVEAL
			})
		}
	}
}
