import { ConfigModule, ConfigService } from '@nestjs/config'
import { GoogleRecaptchaModuleAsyncOptions } from '@nestlab/google-recaptcha/interfaces/google-recaptcha-module-options'

export function getGoogleRecaptchaConfig(): GoogleRecaptchaModuleAsyncOptions {
    return {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            secretKey: configService.getOrThrow<string>('GOOGLE_RECAPTCHA_SECRET_KEY'),
            response: req => req.headers.recaptcha,
            skipIf: configService.getOrThrow<string>('NODE_ENV') === 'development'
        })
    }
}
