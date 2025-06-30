import { IsString } from 'class-validator'

export class StringParamDto {
	@IsString()
	strParam: string
}
