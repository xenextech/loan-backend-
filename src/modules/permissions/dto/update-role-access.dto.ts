import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [String],
    description:
      'Full replacement set of Permission.key values granted to this role — matches how a checkbox matrix saves (send everything currently checked).',
    example: ['applications.read', 'applications.approve'],
  })
  @IsArray()
  @IsString({ each: true })
  permissionKeys!: string[];
}

export class UpdateRoleMenuDto {
  @ApiProperty({
    type: [String],
    description:
      'Full replacement set of MenuItem.key values visible to this role.',
    example: ['dashboard', 'applications', 'notifications'],
  })
  @IsArray()
  @IsString({ each: true })
  visibleMenuItemKeys!: string[];
}

export class UpdateRoleWidgetsDto {
  @ApiProperty({
    type: [String],
    description:
      'Full replacement set of DashboardWidget.key values visible to this role.',
    example: ['loan_statistics', 'notifications_widget'],
  })
  @IsArray()
  @IsString({ each: true })
  visibleWidgetKeys!: string[];
}
