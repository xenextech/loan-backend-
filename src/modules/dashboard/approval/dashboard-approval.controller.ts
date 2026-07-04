import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardApprovalService } from './dashboard-approval.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';

// Read-only by design — no forward/send-back/reject mutation endpoints exist
// here; the underlying LoanApplication has no stage/workflow state machine.
@ApiTags('Dashboard: Approval Workflow')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_STAFF_ROLES)
@Controller('dashboard/approval/:applicationId')
export class DashboardApprovalController {
  constructor(
    private readonly dashboardApprovalService: DashboardApprovalService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Borrower summary for approval review — DSGIR, LTV, CICL, identity, risk grade, collateral, insurance',
  })
  getSummary(@Param('applicationId') applicationId: string) {
    return this.dashboardApprovalService.getSummary(applicationId);
  }

  @Get('credit-score')
  @ApiOperation({ summary: 'Live weighted credit score breakdown' })
  getCreditScore(@Param('applicationId') applicationId: string) {
    return this.dashboardApprovalService.getCreditScore(applicationId);
  }

  @Get('nrb-checklist')
  @ApiOperation({
    summary:
      'Derived NRB compliance checklist — items not backed by a persisted field are marked untracked',
  })
  getNrbChecklist(@Param('applicationId') applicationId: string) {
    return this.dashboardApprovalService.getNrbChecklist(applicationId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Read-only audit trail for this application' })
  getActivity(
    @Param('applicationId') applicationId: string,
    @Query() query: PaginationDto,
  ) {
    return this.dashboardApprovalService.getActivity(applicationId, query);
  }
}
