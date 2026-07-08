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
import {
  ConfigureLoanServicingDto,
  RecordCollectionActivityDto,
  CollectionActivityQueryDto,
  FlagNeedsReviewDto,
  ResolveReviewDto,
} from '../dto/loan-servicing.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../../common/enums';
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
      'Repayment overview — due today, overdue aging buckets (1-30d, 31-90d, 91-180d, 181-365d, 365d+), collection efficiency',
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

  // ── Loan Servicing (Credit Manager only) ───────────────────────────────────

  @Post(':applicationId/servicing/configure')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary:
      'Stage 1 — Configure final rate/tenure/grace-period/start-date for an approved loan and regenerate its EMI schedule',
  })
  configureServicing(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: ConfigureLoanServicingDto,
  ) {
    return this.dashboardRepaymentService.configureServicing(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Post(':applicationId/servicing/notify-borrower')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary:
      'Stage 2 — Notify the student and parent of the finalized loan terms',
  })
  notifyBorrower(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.dashboardRepaymentService.notifyBorrower(
      user.sub,
      applicationId,
    );
  }

  @Post(':applicationId/collection-activity')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({ summary: 'Stage 4 — Record a collection/follow-up activity' })
  recordCollectionActivity(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: RecordCollectionActivityDto,
  ) {
    return this.dashboardRepaymentService.recordCollectionActivity(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Get(':applicationId/collection-activity')
  @ApiOperation({
    summary: 'Stage 4 — List collection/follow-up activity for an application',
  })
  listCollectionActivity(
    @Param('applicationId') applicationId: string,
    @Query() query: CollectionActivityQueryDto,
  ) {
    return this.dashboardRepaymentService.listCollectionActivity(
      applicationId,
      query,
    );
  }

  @Patch(':applicationId/needs-review')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary: 'Stage 6 — Move a loan to Needs Review with a mandatory reason',
  })
  flagNeedsReview(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: FlagNeedsReviewDto,
  ) {
    return this.dashboardRepaymentService.flagNeedsReview(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Patch(':applicationId/resolve-review')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({ summary: 'Stage 6 — Resolve a loan out of Needs Review' })
  resolveReview(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: ResolveReviewDto,
  ) {
    return this.dashboardRepaymentService.resolveReview(
      user.sub,
      applicationId,
      dto,
    );
  }
}
