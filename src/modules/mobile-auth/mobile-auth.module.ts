import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileAuthService } from './mobile-auth.service';
import { MobileOtpService } from './mobile-otp.service';
import { MobileJwtStrategy } from './strategies/mobile-jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('mobileJwt.secret'),
        signOptions: {
          expiresIn: config.get('mobileJwt.expiresIn') ?? '30d',
        },
      }),
    }),
    NotificationsModule,
  ],
  controllers: [MobileAuthController],
  providers: [MobileAuthService, MobileOtpService, MobileJwtStrategy],
  exports: [MobileAuthService],
})
export class MobileAuthModule {}
