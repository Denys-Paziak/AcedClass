import { IsString } from 'class-validator'

export class StringParamDto {
	@IsString({ message: 'Param must be a string.' })
	strParam: string
}
