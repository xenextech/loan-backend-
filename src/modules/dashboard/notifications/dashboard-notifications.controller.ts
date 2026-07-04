import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardNotificationsService } from './dashboard-notifications.service';
import { NotificationLogQueryDto } from '../dto/notification-log-query.dto';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from '../dto/notification-template.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/notifications')
export class DashboardNotificationsController {
  constructor(
    private readonly dashboardNotificationsService: DashboardNotificationsService,
  ) {}

  @Get('log')
  @ApiOperation({
    summary:
      'Notification log (paginated) — channel/status/application/date filters',
  })
  getLog(@Query() query: NotificationLogQueryDto) {
    return this.dashboardNotificationsService.getLog(query);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification message templates (paginated)' })
  listTemplates(@Query() query: PaginationDto) {
    return this.dashboardNotificationsService.listTemplates(query);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a notification message template' })
  createTemplate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateNotificationTemplateDto,
  ) {
    return this.dashboardNotificationsService.createTemplate(user.sub, dto);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update a notification message template' })
  updateTemplate(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.dashboardNotificationsService.updateTemplate(user.sub, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a notification message template' })
  deleteTemplate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.dashboardNotificationsService.deleteTemplate(user.sub, id);
  }
}
