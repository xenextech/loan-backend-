import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardApplicationsService } from './dashboard-applications.service';
import { DashboardApplicationsQueryDto } from '../dto/dashboard-applications-query.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Applications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/applications')
export class DashboardApplicationsController {
  constructor(
    private readonly dashboardApplicationsService: DashboardApplicationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'List submitted applications for credit-ops (paginated) — ref no, borrower, branch, type, amount, grade, stage, DSGIR, LTV, days open. Supports ?filter=my-queue|pending|approval|disbursement|rejected|sent-back',
  })
  list(
    @CurrentUser() user: JwtPayload,
    @Query() query: DashboardApplicationsQueryDto,
  ) {
    return this.dashboardApplicationsService.list(query, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Full application detail' })
  getOne(@Param('id') id: string) {
    return this.dashboardApplicationsService.getOne(id);
  }

  @Get(':id/detail')
  @ApiOperation({
    summary:
      'Merged applicant detail view — full record, loan account, live credit score, and paginated activity/audit trail in one call',
  })
  getDetail(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.dashboardApplicationsService.getDetail(id, query);
  }
}
