import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'
import { RegistrationDto } from '../modules/auth/dtos/Registration.dto'

@ValidatorConstraint({ name: 'IsPasswordsEqual', async: false })
export class IsPasswordsEqual implements ValidatorConstraintInterface {
	public validate(
		passwordConfirmation: string,
		validationArguments?: ValidationArguments
	): Promise<boolean> | boolean {
		const dto = validationArguments?.object as RegistrationDto

		return passwordConfirmation === dto.password
	}

	defaultMessage(): string {
		return 'Passwords do not match'
	}
}
