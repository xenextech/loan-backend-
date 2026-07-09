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
  CompleteClearanceDto,
  REVIEW_ASSIGNABLE_ROLES,
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

  @Get(':applicationId/status')
  @ApiOperation({
    summary:
      'Repayment monitoring status for one application — on-time/overdue, days overdue, paid/upcoming/overdue installment counts, total paid vs repayable, next due date',
  })
  getRepaymentStatus(@Param('applicationId') applicationId: string) {
    return this.dashboardRepaymentService.getRepaymentStatus(applicationId);
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
    summary:
      "Stage 6 — Move a loan to Needs Review with a mandatory reason. Optionally hand the review to a specific earlier-pipeline role (Initiator/Supporter/Checker/Approver) via assignedRole — the Credit Manager's call; omit to review it themselves.",
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

  @Get('needs-review')
  @ApiOperation({
    summary:
      'My review queue — Credit Manager/Admin see every Needs-Review loan; Initiator/Supporter/Checker/Approver see only the ones the Credit Manager assigned to their role',
  })
  listNeedsReview(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationDto,
  ) {
    return this.dashboardRepaymentService.listNeedsReview(user.role, query);
  }

  @Patch(':applicationId/resolve-review')
  @Roles(UserRole.CREDIT_MANAGER, ...REVIEW_ASSIGNABLE_ROLES)
  @ApiOperation({
    summary:
      'Stage 6 — Resolve a loan out of Needs Review. Callable by the Credit Manager, or by whichever role the review was assigned to (enforced against the specific loan, not just role membership).',
  })
  resolveReview(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: ResolveReviewDto,
  ) {
    return this.dashboardRepaymentService.resolveReview(
      user.sub,
      user.role,
      applicationId,
      dto,
    );
  }

  @Post(':applicationId/complete-clearance')
  @Roles(UserRole.CREDIT_MANAGER)
  @ApiOperation({
    summary:
      'Stage 7 — Confirm and close out a fully-paid loan (all installments PAID). Notifies the student and parent that the loan is cleared. 400s if any installment is still unpaid.',
  })
  completeClearance(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: CompleteClearanceDto,
  ) {
    return this.dashboardRepaymentService.completeClearance(
      user.sub,
      applicationId,
      dto,
    );
  }
}
