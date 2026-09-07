import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { ApplicationTrackerService } from './application-tracker.service';
import { VerificationInvitationService } from '../verification/verification-invitation.service';
import { Step1Dto } from './dto/step1.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { SendVerificationDto } from './dto/send-verification.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ApplicationTrackerResponseDto } from './dto/application-tracker.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SensitiveThrottle } from '../../common/decorators/throttle-policy.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Applications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly applicationTrackerService: ApplicationTrackerService,
    private readonly verificationInvitationService: VerificationInvitationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new draft application' })
  create(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.create(user.sub);
  }

  @Get()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'List my applications' })
  findMy(@CurrentUser() user: JwtPayload, @Query() query: QueryApplicationDto) {
    return this.applicationsService.findMyApplications(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.findOne(id, user.sub, user.role);
  }

  @Get(':id/tracker')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Application progress tracker for the student dashboard',
    description:
      'Returns every stage of the application lifecycle (Student → Parent → ' +
      'College → Initiator → Supporter → Credit Manager Review → Approver → ' +
      'Credit Manager Loan Setup → Disbursement), each with a status of ' +
      'COMPLETED / IN_PROGRESS / PENDING / REJECTED / SENT_BACK, plus the ' +
      'current stage, current owner role, and overall progress percentage. ' +
      'Derived entirely from existing fields (stage, sign-off dates, ' +
      'verification submittedAt columns, LoanAccount/Disbursement records) ' +
      'and the audit log — nothing is stored separately for this endpoint.',
  })
  @ApiOkResponse({ type: ApplicationTrackerResponseDto })
  getTracker(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<ApplicationTrackerResponseDto> {
    return this.applicationTrackerService.getTracker(id, user.sub, user.role);
  }

  @Patch(':id/step1')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Save Step 1 — Personal, study, and loan information',
  })
  saveStep1(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step1Dto,
  ) {
    return this.applicationsService.saveStep1(id, user.sub, dto);
  }

  @Patch(':id/step2')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save Step 2 — Identity & address' })
  saveStep2(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step2Dto,
  ) {
    return this.applicationsService.saveStep2(id, user.sub, dto);
  }

  @Patch(':id/step3')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save Step 3 — Family & fee structure' })
  saveStep3(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step3Dto,
  ) {
    return this.applicationsService.saveStep3(id, user.sub, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Submit application (Step 4 declaration + final status change)',
  })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Step4Dto,
  ) {
    return this.applicationsService.submit(id, user.sub, dto);
  }

  @Get(':id/verification')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      'Parent/college verification status — never includes the raw token',
  })
  getVerificationStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.verificationInvitationService.getStatus(id, user.sub);
  }

  @Post(':id/verification/parent')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Send a parent verification invitation' })
  sendParentVerification(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SendVerificationDto,
  ) {
    return this.verificationInvitationService.send(
      id,
      user.sub,
      'PARENT',
      dto.email,
    );
  }

  @Post(':id/verification/parent/resend')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @SensitiveThrottle()
  @ApiOperation({
    summary: 'Resend the parent verification invitation (rate-limited)',
  })
  resendParentVerification(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.verificationInvitationService.resend(id, user.sub, 'PARENT');
  }

  @Post(':id/verification/college')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Send a college verification invitation' })
  sendCollegeVerification(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SendVerificationDto,
  ) {
    return this.verificationInvitationService.send(
      id,
      user.sub,
      'COLLEGE',
      dto.email,
    );
  }

  @Post(':id/verification/college/resend')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @SensitiveThrottle()
  @ApiOperation({
    summary: 'Resend the college verification invitation (rate-limited)',
  })
  resendCollegeVerification(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.verificationInvitationService.resend(id, user.sub, 'COLLEGE');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete a draft application' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.deleteDraft(id, user.sub);
  }

  @Get(':id/consent')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      "Get the Approver-authored terms & conditions consent status for this application — null if none has been sent yet. Only the application's own owner can access this.",
  })
  getConsent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.getMyConsent(id, user.sub);
  }

  @Post(':id/consent/accept')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary:
      "Record the logged-in student's consent to the terms sent by the Approver. Requires being signed in as the account that owns this application.",
  })
  acceptConsent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.applicationsService.acceptMyConsent(id, user.sub, req.ip);
  }
}
