import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileJwtPayload } from '../interfaces/mobile-jwt-payload.interface';

// Registered under the 'mobile-jwt' Passport strategy name (second ctor arg
// to PassportStrategy) so it never collides with the web/staff 'jwt'
// strategy — MobileJwtAuthGuard is the only guard that activates it.
@Injectable()
export class MobileJwtStrategy extends PassportStrategy(
  Strategy,
  'mobile-jwt',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('mobileJwt.secret') ?? 'fallback',
    });
  }

  async validate(payload: MobileJwtPayload): Promise<MobileJwtPayload> {
    const user = await this.prisma.mobileUser.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      sub: user.id,
      phoneNumber: user.phoneNumber,
    };
  }
}
