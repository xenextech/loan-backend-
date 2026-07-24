import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission_key';

/**
 * Gates a route on a fine-grained Permission.key (e.g. "applications.delete")
 * via PermissionsGuard, checked against the caller's role's RolePermission
 * rows — the Admin-configurable replacement for scattering
 * `if (role === 'X')` checks through service methods.
 */
export const RequirePermission = (key: string) => SetMetadata(PERMISSION_KEY, key);
