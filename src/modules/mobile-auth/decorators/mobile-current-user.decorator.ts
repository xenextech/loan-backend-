import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MobileJwtPayload } from '../interfaces/mobile-jwt-payload.interface';

export const MobileCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): MobileJwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: MobileJwtPayload }>();
    return request.user;
  },
);
