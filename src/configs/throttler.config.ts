import { Reflector } from '@nestjs/core'
import { minutes, ThrottlerAsyncOptions } from '@nestjs/throttler'

export function getThrottlerConfig(): ThrottlerAsyncOptions {
	return {
		inject: [Reflector],
		useFactory: (reflector: Reflector) => ({
			throttlers: [
				{
					ttl: minutes(1),
					limit: 60
				}
			],
			errorMessage(context, throttlerLimitDetail) {
				const customMessage = reflector.get<string>('throttle_message', context.getHandler())

				return customMessage || 'Too many requests. Try again later.'
			}
		})
	}
}
