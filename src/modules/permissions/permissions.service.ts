import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/enums';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

export interface MenuGroup {
  groupLabel: string | null;
  items: {
    key: string;
    label: string;
    href: string;
    icon: string;
    order: number;
  }[];
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Self-lookup (every authenticated user) ─────────────────────────────────
  // Drives the frontend's dynamic sidebar + permission checks — one call on
  // login, no per-page role branching needed downstream.
  async getMyAccess(role: UserRole) {
    const roleRow = await this.prisma.role.findUnique({ where: { code: role } });
    if (!roleRow) {
      // Role exists in the UserRole enum but has no configuration row yet
      // (e.g. freshly extended enum, seed not run) — fail open with zero
      // permissions/menu rather than 500, so login still works.
      return { role, permissions: [] as string[], menu: [] as MenuGroup[], widgets: [] as string[] };
    }

    const [permissionRows, menuRows, widgetRows] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { roleId: roleRow.id },
        include: { permission: true },
      }),
      this.prisma.roleMenuItem.findMany({
        where: { roleId: roleRow.id, visible: true },
        include: { menuItem: true },
        orderBy: { menuItem: { order: 'asc' } },
      }),
      this.prisma.roleWidget.findMany({
        where: { roleId: roleRow.id, visible: true },
        include: { widget: true },
      }),
    ]);

    const groups = new Map<string | null, MenuGroup>();
    for (const row of menuRows) {
      const label = row.menuItem.groupLabel;
      if (!groups.has(label)) groups.set(label, { groupLabel: label, items: [] });
      groups.get(label)!.items.push({
        key: row.menuItem.key,
        label: row.menuItem.label,
        href: row.menuItem.href,
        icon: row.menuItem.icon,
        order: row.menuItem.order,
      });
    }

    return {
      role,
      permissions: permissionRows.map((r) => r.permission.key),
      menu: Array.from(groups.values()),
      widgets: widgetRows.map((r) => r.widget.key),
    };
  }

  // ── Roles ────────────────────────────────────────────────────────────────
  listRoles() {
    return this.prisma.role.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async createRole(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Role code "${dto.code}" already exists`);
    return this.prisma.role.create({
      data: { code: dto.code, name: dto.name, description: dto.description, isSystem: false },
    });
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  private async getRoleOrThrow(roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  // ── Catalog (full permission/menu/widget list for the admin matrix UI) ────
  async getCatalog() {
    const [permissions, menuItems, widgets] = await Promise.all([
      this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }] }),
      this.prisma.menuItem.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.dashboardWidget.findMany({ orderBy: { key: 'asc' } }),
    ]);

    const permissionsByModule = new Map<string, typeof permissions>();
    for (const p of permissions) {
      if (!permissionsByModule.has(p.module)) permissionsByModule.set(p.module, []);
      permissionsByModule.get(p.module)!.push(p);
    }

    return {
      permissionModules: Array.from(permissionsByModule.entries()).map(([module, items]) => ({
        module,
        permissions: items,
      })),
      menuItems,
      widgets,
    };
  }

  // ── Role ↔ Permission ───────────────────────────────────────────────────
  async getRolePermissionKeys(roleId: string): Promise<string[]> {
    await this.getRoleOrThrow(roleId);
    const rows = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rows.map((r) => r.permission.key);
  }

  async setRolePermissions(roleId: string, permissionKeys: string[]) {
    await this.getRoleOrThrow(roleId);
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });
    const unknown = permissionKeys.filter((k) => !permissions.some((p) => p.key === k));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown permission key(s): ${unknown.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
      }),
    ]);
    return this.getRolePermissionKeys(roleId);
  }

  // ── Role ↔ Sidebar (MenuItem) ───────────────────────────────────────────
  // Every catalog item gets an explicit row (visible true/false) once a role
  // is edited — PermissionsGuard only fails open when NO row exists at all,
  // so "hidden" must be recorded explicitly, not inferred from absence.
  async getRoleMenuState(roleId: string) {
    await this.getRoleOrThrow(roleId);
    const [menuItems, roleMenuItems] = await Promise.all([
      this.prisma.menuItem.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.roleMenuItem.findMany({ where: { roleId } }),
    ]);
    const visibleByItemId = new Map(roleMenuItems.map((r) => [r.menuItemId, r.visible]));
    return menuItems.map((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      icon: item.icon,
      groupLabel: item.groupLabel,
      order: item.order,
      isApiGuarded: item.isApiGuarded,
      // Unconfigured (no row) defaults to visible — matches the guard's
      // fail-open default and the seed's "mirror current behavior" goal.
      visible: visibleByItemId.get(item.id) ?? true,
    }));
  }

  async setRoleMenu(roleId: string, visibleMenuItemKeys: string[]) {
    await this.getRoleOrThrow(roleId);
    const menuItems = await this.prisma.menuItem.findMany();
    const unknown = visibleMenuItemKeys.filter((k) => !menuItems.some((m) => m.key === k));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown menu key(s): ${unknown.join(', ')}`);
    }

    const visibleSet = new Set(visibleMenuItemKeys);
    await this.prisma.$transaction(
      menuItems.map((item) =>
        this.prisma.roleMenuItem.upsert({
          where: { roleId_menuItemId: { roleId, menuItemId: item.id } },
          update: { visible: visibleSet.has(item.key) },
          create: { roleId, menuItemId: item.id, visible: visibleSet.has(item.key) },
        }),
      ),
    );
    return this.getRoleMenuState(roleId);
  }

  // ── Role ↔ Dashboard Widgets ─────────────────────────────────────────────
  async getRoleWidgetState(roleId: string) {
    await this.getRoleOrThrow(roleId);
    const [widgets, roleWidgets] = await Promise.all([
      this.prisma.dashboardWidget.findMany({ orderBy: { key: 'asc' } }),
      this.prisma.roleWidget.findMany({ where: { roleId } }),
    ]);
    const visibleByWidgetId = new Map(roleWidgets.map((r) => [r.widgetId, r.visible]));
    return widgets.map((w) => ({
      key: w.key,
      label: w.label,
      description: w.description,
      visible: visibleByWidgetId.get(w.id) ?? true,
    }));
  }

  async setRoleWidgets(roleId: string, visibleWidgetKeys: string[]) {
    await this.getRoleOrThrow(roleId);
    const widgets = await this.prisma.dashboardWidget.findMany();
    const unknown = visibleWidgetKeys.filter((k) => !widgets.some((w) => w.key === k));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown widget key(s): ${unknown.join(', ')}`);
    }

    const visibleSet = new Set(visibleWidgetKeys);
    await this.prisma.$transaction(
      widgets.map((w) =>
        this.prisma.roleWidget.upsert({
          where: { roleId_widgetId: { roleId, widgetId: w.id } },
          update: { visible: visibleSet.has(w.key) },
          create: { roleId, widgetId: w.id, visible: visibleSet.has(w.key) },
        }),
      ),
    );
    return this.getRoleWidgetState(roleId);
  }
}
