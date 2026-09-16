// Class (not interface) so emitDecoratorMetadata can reference it at runtime
// — mirrors JwtPayload (src/common/interfaces), but deliberately its own type
// since a mobile token's `sub` is a MobileUser id, not a User id.
export class MobileJwtPayload {
  sub: string;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}
