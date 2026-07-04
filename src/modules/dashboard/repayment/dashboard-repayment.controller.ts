import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardRepaymentService } from './dashboard-repayment.service';
import { OverdueQueryDto, MarkEmiPaidDto } from '../dto/repayment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

@ApiTags('Dashboard: Repayment')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/repayment')
export class DashboardRepaymentController {
  constructor(
    private readonly dashboardRepaymentService: DashboardRepaymentService,
  ) {}

  @Post(':applicationId/generate-schedule')
  @ApiOperation({
    summary:
      'Generate (or regenerate) the full EMI amortization schedule for an application',
  })
  generateSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.dashboardRepaymentService.generateSchedule(
      user.sub,
      applicationId,
    );
  }

  @Get(':applicationId/schedule')
  @ApiOperation({
    summary: 'Get the EMI schedule for an application (paginated)',
  })
  getSchedule(
    @Param('applicationId') applicationId: string,
    @Query() query: PaginationDto,
  ) {
    return this.dashboardRepaymentService.getSchedule(applicationId, query);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'List overdue EMI entries (paginated), optionally by bucket',
  })
  getOverdue(@Query() query: OverdueQueryDto) {
    return this.dashboardRepaymentService.getOverdue(query);
  }

  @Get('overview')
  @ApiOperation({
    summary:
      'Repayment overview — due today, overdue buckets (1-30d, 31-90d), collection efficiency',
  })
  getOverview() {
    return this.dashboardRepaymentService.getOverview();
  }

  @Patch('schedule/:entryId/mark-paid')
  @ApiOperation({ summary: 'Record a payment against an EMI schedule entry' })
  markPaid(
    @CurrentUser() user: JwtPayload,
    @Param('entryId') entryId: string,
    @Body() dto: MarkEmiPaidDto,
  ) {
    return this.dashboardRepaymentService.markPaid(user.sub, entryId, dto);
  }

  @Get('notification-triggers')
  @ApiOperation({ summary: 'Static EMI notification trigger schedule' })
  getNotificationTriggers() {
    return this.dashboardRepaymentService.getNotificationTriggers();
  }
}
