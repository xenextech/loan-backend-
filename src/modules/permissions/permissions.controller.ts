import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import {
  UpdateRoleMenuDto,
  UpdateRolePermissionsDto,
  UpdateRoleWidgetsDto,
} from './dto/update-role-access.dto';

@ApiTags('Permissions (RBAC)')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('me')
  @ApiOperation({
    summary:
      "Effective permissions, sidebar menu, and dashboard widgets for the caller's role — the single call the frontend uses to build the dynamic sidebar and gate UI on login. No @Roles() restriction: every authenticated user calls this for themselves.",
  })
  getMyAccess(@CurrentUser() user: JwtPayload) {
    return this.permissionsService.getMyAccess(user.role);
  }

  @Get('catalog')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Full permission/menu/widget catalog grouped for the Super Admin permission-matrix UI.',
  })
  getCatalog() {
    return this.permissionsService.getCatalog();
  }

  @Get('roles')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all configurable roles' })
  listRoles() {
    return this.permissionsService.listRoles();
  }

  @Post('roles')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Create a new configurable role. Note: for a real user to authenticate as this role, the UserRole Postgres enum must also be extended with a matching value in a follow-up migration — this only creates the permission-configuration side.',
  })
  createRole(@Body() dto: CreateRoleDto) {
    return this.permissionsService.createRole(dto);
  }

  @Patch('roles/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update a role's display name/description" })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.permissionsService.updateRole(id, dto);
  }

  @Get('roles/:roleId/permissions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Permission keys currently granted to a role' })
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getRolePermissionKeys(roleId);
  }

  @Put('roles/:roleId/permissions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Replace the full set of permissions granted to a role. Takes effect immediately for every subsequent request — no deploy, no restart.',
  })
  setRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.permissionsService.setRolePermissions(
      roleId,
      dto.permissionKeys,
    );
  }

  @Get('roles/:roleId/menu')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      "Full menu catalog with this role's current visibility state per item",
  })
  getRoleMenu(@Param('roleId') roleId: string) {
    return this.permissionsService.getRoleMenuState(roleId);
  }

  @Put('roles/:roleId/menu')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Replace which sidebar menu items are visible to a role. Enforced both client-side (sidebar rendering) and server-side (PermissionsGuard on routes tagged with @RequireMenuKey) — hiding a menu item also blocks direct-URL access to routes gated on that key.',
  })
  setRoleMenu(@Param('roleId') roleId: string, @Body() dto: UpdateRoleMenuDto) {
    return this.permissionsService.setRoleMenu(roleId, dto.visibleMenuItemKeys);
  }

  @Get('roles/:roleId/widgets')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "Full widget catalog with this role's current visibility state",
  })
  getRoleWidgets(@Param('roleId') roleId: string) {
    return this.permissionsService.getRoleWidgetState(roleId);
  }

  @Put('roles/:roleId/widgets')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Replace which dashboard widgets are visible to a role',
  })
  setRoleWidgets(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleWidgetsDto,
  ) {
    return this.permissionsService.setRoleWidgets(
      roleId,
      dto.visibleWidgetKeys,
    );
  }
}
