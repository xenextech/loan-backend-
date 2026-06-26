import type { UserRole } from '../../common/enums';

// Class (not interface) so emitDecoratorMetadata can reference it at runtime
export class JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
