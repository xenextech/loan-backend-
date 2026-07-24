import { SetMetadata } from '@nestjs/common';

export const MENU_KEY = 'menu_key';

/**
 * Ties a route to a MenuItem.key so PermissionsGuard can enforce, server-side,
 * the same visibility the Admin configures for the sidebar — "hide the menu"
 * and "block the URL" are the same toggle, not two things to keep in sync.
 */
export const RequireMenuKey = (key: string) => SetMetadata(MENU_KEY, key);
