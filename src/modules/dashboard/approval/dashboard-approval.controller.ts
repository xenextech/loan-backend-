import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardApprovalService } from './dashboard-approval.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../../common/enums';
import { DASHBOARD_STAFF_ROLES } from '../dashboard-roles.constant';
import {
  RejectApplicationDto,
  SendBackApplicationDto,
  PepScreeningDto,
  SendStudentConsentDto,
} from '../dto/approval-transition.dto';

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

  @Post('support')
  @Roles(UserRole.SUPPORTER)
  @ApiOperation({
    summary: 'Support the application — advances stage to SUPPORTED',
  })
  support(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.dashboardApprovalService.support(user.sub, applicationId);
  }

  @Post('check')
  @Roles(UserRole.CHECKER)
  @ApiOperation({
    summary:
      'Check the application — verification/eligibility/compliance review, advances stage to CHECKING. Credit Manager no longer shares this action — see pep-screening below for the same split.',
  })
  check(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.dashboardApprovalService.check(user.sub, applicationId);
  }

  @Post('approve')
  @Roles(UserRole.APPROVER)
  @ApiOperation({
    summary: 'Approve the application — advances stage to APPROVED',
  })
  approve(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
  ) {
    return this.dashboardApprovalService.approve(user.sub, applicationId);
  }

  @Post('reject')
  @Roles(UserRole.CREDIT_MANAGER, UserRole.CHECKER, UserRole.APPROVER)
  @ApiOperation({ summary: 'Reject the application' })
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.dashboardApprovalService.reject(user.sub, applicationId, dto);
  }

  @Post('send-back')
  @Roles(
    UserRole.SUPPORTER,
    UserRole.CREDIT_MANAGER,
    UserRole.CHECKER,
    UserRole.APPROVER,
  )
  @ApiOperation({ summary: 'Send the application back to an earlier stage' })
  sendBack(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: SendBackApplicationDto,
  ) {
    return this.dashboardApprovalService.sendBack(user.sub, applicationId, dto);
  }

  @Get('student-consent')
  @ApiOperation({
    summary:
      "Get the current student consent status for this application — null if the Approver hasn't sent one yet",
  })
  getStudentConsent(@Param('applicationId') applicationId: string) {
    return this.dashboardApprovalService.getStudentConsent(applicationId);
  }

  @Post('student-consent')
  @Roles(UserRole.APPROVER)
  @ApiOperation({
    summary:
      'Send custom terms & conditions to the student via a magic link for their consent',
  })
  sendStudentConsent(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: SendStudentConsentDto,
  ) {
    return this.dashboardApprovalService.sendStudentConsent(
      user.sub,
      applicationId,
      dto,
    );
  }

  @Post('pep-screening')
  @Roles(UserRole.CHECKER)
  @ApiOperation({
    summary:
      'Record the applicant PEP (Politically Exposed Person) screening result — part of the Checker verification/compliance duties',
  })
  recordPepScreening(
    @CurrentUser() user: JwtPayload,
    @Param('applicationId') applicationId: string,
    @Body() dto: PepScreeningDto,
  ) {
    return this.dashboardApprovalService.recordPepScreening(
      user.sub,
      applicationId,
      dto,
    );
  }
}
