import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardOverviewService } from './dashboard-overview.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Overview')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/overview')
export class DashboardOverviewController {
  constructor(
    private readonly dashboardOverviewService: DashboardOverviewService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Dashboard summary — portfolio total, pending-my-action, overdue EMI, commission this month, approval pipeline (approximate), alerts',
  })
  getOverview() {
    return this.dashboardOverviewService.getOverview();
  }

  @Get('checker-queue')
  @ApiOperation({ summary: 'Applications awaiting approval (paginated)' })
  getCheckerQueue(@Query() query: PaginationDto) {
    return this.dashboardOverviewService.getCheckerQueue(query);
  }

  @Get('alerts')
  @ApiOperation({
    summary:
      'Alerts requiring action — CICL flags, expiring insurance, overdue EMIs (paginated)',
  })
  getAlerts(@Query() query: PaginationDto) {
    return this.dashboardOverviewService.getAlerts(query);
  }
}
