import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { MENU_KEY } from '../decorators/require-menu-key.decorator';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

/**
 * Admin-configurable, DB-driven authorization layer that runs *in addition
 * to* JwtAuthGuard/RolesGuard — it never replaces them. Two independent
 * checks, each only active when the matching decorator is present:
 *
 *  - @RequireMenuKey(key): denies if the caller's role has an explicit
 *    RoleMenuItem row for that key with visible=false. No row at all means
 *    "not yet configured by the Admin" and fails OPEN (allow) — this is
 *    what makes the rollout non-breaking: every currently-visible menu item
 *    is seeded as an explicit visible=true row per role, so behavior is
 *    unchanged until an Admin actively hides something.
 *
 *  - @RequirePermission(key): denies if no RolePermission row grants that
 *    key to the caller's role. Unlike menu visibility this fails CLOSED
 *    when the Permission itself is registered — action permissions are a
 *    new capability being introduced fresh, not a replacement for an
 *    existing enforced mechanism, so "must be explicitly granted" is the
 *    correct default. If the Permission key isn't registered in the DB at
 *    all, the check is skipped (allow) — an unregistered key means the
 *    concept isn't wired up yet, not that access should be blocked.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const menuKey = this.reflector.getAllAndOverride<string | undefined>(
      MENU_KEY,
      [context.getHandler(), context.getClass()],
    );
    const permissionKey = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!menuKey && !permissionKey) return true;

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const role = request.user?.role;
    if (!role) throw new ForbiddenException('Authentication required');

    if (menuKey) {
      const roleRow = await this.prisma.role.findUnique({ where: { code: role } });
      if (roleRow) {
        const entry = await this.prisma.roleMenuItem.findFirst({
          where: { roleId: roleRow.id, menuItem: { key: menuKey } },
        });
        if (entry && !entry.visible) {
          throw new ForbiddenException(
            `Your role does not have access to "${menuKey}"`,
          );
        }
      }
    }

    if (permissionKey) {
      const permission = await this.prisma.permission.findUnique({
        where: { key: permissionKey },
      });
      if (permission) {
        const roleRow = await this.prisma.role.findUnique({ where: { code: role } });
        const granted = roleRow
          ? await this.prisma.rolePermission.findFirst({
              where: { roleId: roleRow.id, permissionId: permission.id },
            })
          : null;
        if (!granted) {
          throw new ForbiddenException(
            `Your role does not have the "${permissionKey}" permission`,
          );
        }
      }
    }

    return true;
  }
}
