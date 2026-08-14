import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  AuditAction,
  AuditCategory,
  ApplicationStage,
  ApprovalEntryStatus,
  UserRole,
} from '../../../common/enums';
import { generateLoanAccountNumber } from '../../../common/utils/loan-account-number.util';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  SupportApplicationDto,
  CheckApplicationDto,
  ApproveApplicationDto,
  RejectApplicationDto,
  SendBackApplicationDto,
  PepScreeningDto,
  SendStudentConsentDto,
  RoleAttestationDto,
} from '../dto/approval-transition.dto';

// Valid predecessor stage(s) for each transition — null means "no prior
// stage required" (an application with stage: null can still be supported).
const ALLOWED_FROM_STAGE: Record<
  'support' | 'check' | 'approve',
  (ApplicationStage | null)[]
> = {
  support: [null, ApplicationStage.INITIATED, ApplicationStage.SENT_BACK],
  check: [ApplicationStage.SUPPORTED, ApplicationStage.SENT_BACK],
  approve: [ApplicationStage.CHECKING],
};

@Injectable()
export class DashboardApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditScore: CreditScoreService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  private async getApplicationOrThrow(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { personalGuarantee: true, insurance: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  private assertTransitionAllowed(
    transition: keyof typeof ALLOWED_FROM_STAGE,
    currentStage: ApplicationStage | null,
  ) {
    if (!ALLOWED_FROM_STAGE[transition].includes(currentStage)) {
      throw new BadRequestException(
        `Cannot ${transition} an application at stage "${currentStage ?? 'none'}"`,
      );
    }
  }

  // Resolves the acting approver's identity from the authenticated user's DB
  // row (never from request input) so every approval stage can stamp who
  // actually performed it alongside when.
  private async resolveActingUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, name: user.fullName ?? user.email, role: user.role };
  }

  // reject()/sendBack() are shared across multiple roles (see their @Roles
  // lists), so — unlike support()/check()/approve(), which each belong to
  // exactly one role — the *Status column they stamp depends on who's
  // actually acting. CREDIT_MANAGER reuses the checker* columns, same as
  // everywhere else in this system (see schema.prisma's "Approval Section").
  private approvalStatusColumnForRole(
    role: UserRole,
  ): 'supporterStatus' | 'checkerStatus' | 'approverStatus' | null {
    switch (role) {
      case UserRole.SUPPORTER:
        return 'supporterStatus';
      case UserRole.CHECKER:
      case UserRole.CREDIT_MANAGER:
        return 'checkerStatus';
      case UserRole.APPROVER:
        return 'approverStatus';
      default:
        return null;
    }
  }

  // Shapes a stage's stored user/name/date columns into the
  // { id, name, approvedAt } | null contract returned by getSummary().
  private stageApprovalInfo(
    userId: string | null,
    name: string | null,
    approvedAt: Date | null,
    post?: string | null,
    branch?: string | null,
  ) {
    if (!approvedAt) return null;
    return { id: userId, name, approvedAt, post: post ?? null, branch: branch ?? null };
  }

  // The Branch Name/Designation the acting role recorded for their own
  // decision, written to that role's own *Post/*Branch columns — same
  // role→column-prefix mapping as approvalStatusColumnForRole (CREDIT_MANAGER
  // reuses checker*). Only includes keys the caller actually sent, so an
  // omitted field never clobbers a previously-recorded value.
  private attestationFields(role: UserRole, dto: RoleAttestationDto) {
    const prefix =
      role === UserRole.SUPPORTER
        ? 'supporter'
        : role === UserRole.CHECKER || role === UserRole.CREDIT_MANAGER
          ? 'checker'
          : role === UserRole.APPROVER
            ? 'approver'
            : null;
    if (!prefix) return {};
    return {
      ...(dto.designation !== undefined && { [`${prefix}Post`]: dto.designation }),
      ...(dto.branchName !== undefined && { [`${prefix}Branch`]: dto.branchName }),
      ...(dto.signature !== undefined && { [`${prefix}Signature`]: dto.signature }),
    };
  }

  // The Initiator has no formal stage in the approval chain — no
  // initiator*Status column exists, unlike supporter/checker/approver — so
  // when a send-back targets them, nothing advances the stage until they
  // explicitly resubmit. Only reachable while stage is SENT_BACK. Lands on
  // CHECKING (Approver-actionable) if the Approver themself sent it back
  // (skipping Supporter/Checker re-review of the same fix), otherwise on
  // SUPPORTED — the same normal next stage support() itself sets, since the
  // Initiator isn't a reviewer, just resuming the chain at the Supporter.
  async resubmit(userId: string, applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);
    if (
      application.stage !== ApplicationStage.SENT_BACK ||
      application.sentBackToStage !== ApplicationStage.INITIATED
    ) {
      throw new BadRequestException(
        'This application was not sent back to the Initiator — nothing to resubmit.',
      );
    }
    const shortcut = application.sentBackByApprover;
    const nextStage = shortcut
      ? ApplicationStage.CHECKING
      : ApplicationStage.SUPPORTED;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: nextStage,
        ...(shortcut && { sentBackByApprover: false }),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_RESUBMITTED,
      { stage: nextStage, skippedToApprover: shortcut },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async support(
    userId: string,
    applicationId: string,
    dto: SupportApplicationDto = {},
  ) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('support', application.stage);
    const actor = await this.resolveActingUser(userId);

    // Approver-originated send-back shortcut: skip straight to CHECKING
    // (Approver-actionable) instead of the normal SUPPORTED stage, so the
    // Checker doesn't have to re-review something the Approver only sent
    // back to the Supporter/Initiator for.
    const shortcut = application.sentBackByApprover;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: shortcut
          ? ApplicationStage.CHECKING
          : ApplicationStage.SUPPORTED,
        supporterUserId: actor.id,
        supporterName: actor.name,
        supporterDate: new Date(),
        supporterStatus: ApprovalEntryStatus.APPROVED,
        ...this.attestationFields(actor.role, dto),
        ...(shortcut && { sentBackByApprover: false }),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SUPPORTED,
      { stage: updated.stage, skippedToApprover: shortcut },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async check(
    userId: string,
    applicationId: string,
    dto: CheckApplicationDto = {},
  ) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('check', application.stage);
    const actor = await this.resolveActingUser(userId);
    const shortcut = application.sentBackByApprover;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.CHECKING,
        checkerUserId: actor.id,
        checkerName: actor.name,
        checkerDate: new Date(),
        checkerStatus: ApprovalEntryStatus.APPROVED,
        ...this.attestationFields(actor.role, dto),
        ...(shortcut && { sentBackByApprover: false }),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_CHECKED,
      { stage: ApplicationStage.CHECKING },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async approve(
    userId: string,
    applicationId: string,
    dto: ApproveApplicationDto = {},
  ) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('approve', application.stage);
    const actor = await this.resolveActingUser(userId);

    const [updated, loanAccount] = await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id: applicationId },
        data: {
          stage: ApplicationStage.APPROVED,
          approverUserId: actor.id,
          approverName: actor.name,
          approverDate: new Date(),
          approverStatus: ApprovalEntryStatus.APPROVED,
          ...this.attestationFields(actor.role, dto),
        },
      }),
      this.prisma.loanAccount.create({
        data: {
          applicationId,
          loanAccountNumber: generateLoanAccountNumber(),
        },
      }),
    ]);

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_APPROVED,
      { stage: ApplicationStage.APPROVED },
      applicationId,
      AuditCategory.APPROVAL,
    );
    await this.audit.log(
      userId,
      AuditAction.LOAN_ACCOUNT_CREATED,
      {
        loanAccountId: loanAccount.id,
        loanAccountNumber: loanAccount.loanAccountNumber,
      },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async reject(
    userId: string,
    applicationId: string,
    dto: RejectApplicationDto,
  ) {
    await this.getApplicationOrThrow(applicationId);
    const actor = await this.resolveActingUser(userId);
    const statusColumn = this.approvalStatusColumnForRole(actor.role);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.REJECTED,
        rejectionReason: dto.reason,
        rejectedAt: new Date(),
        rejectedByUserId: userId,
        ...(statusColumn && { [statusColumn]: ApprovalEntryStatus.REJECTED }),
        ...this.attestationFields(actor.role, dto),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_REJECTED,
      { reason: dto.reason },
      applicationId,
      AuditCategory.APPROVAL,
    );
    await this.notifications.notifyApplicationRejected(applicationId);
    return updated;
  }

  async sendBack(
    userId: string,
    applicationId: string,
    dto: SendBackApplicationDto,
  ) {
    await this.getApplicationOrThrow(applicationId);
    const actor = await this.resolveActingUser(userId);
    const statusColumn = this.approvalStatusColumnForRole(actor.role);
    const toStage = dto.toStage ?? ApplicationStage.INITIATED;
    // Only an Approver-originated send-back grants the "skip back to
    // Approver" shortcut consumed by support()/check() — Supporter/Checker/
    // Credit Manager send-backs go through the normal hierarchy as before.
    const sentBackByApprover = actor.role === UserRole.APPROVER;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.SENT_BACK,
        sentBackReason: dto.reason,
        sentBackAt: new Date(),
        sentBackByUserId: userId,
        sentBackToStage: toStage,
        sentBackByApprover,
        ...(statusColumn && {
          [statusColumn]: ApprovalEntryStatus.SENT_BACK,
        }),
        ...this.attestationFields(actor.role, dto),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SENT_BACK,
      { reason: dto.reason, toStage },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async recordPepScreening(
    userId: string,
    applicationId: string,
    dto: PepScreeningDto,
  ) {
    await this.getApplicationOrThrow(applicationId);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        pepStatus: dto.status,
        pepRemarks: dto.remarks,
        pepCheckedAt: new Date(),
        pepCheckedByUserId: userId,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.PEP_SCREENING_RECORDED,
      { status: dto.status, remarks: dto.remarks },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async getStudentConsent(applicationId: string) {
    return this.prisma.studentConsent.findUnique({
      where: { applicationId },
    });
  }

  // Notifies the student that new terms are waiting, but does NOT grant
  // consent power via the link itself — consent can only be recorded once
  // the student is logged into their own account and it's their own
  // application (see ApplicationsController's student-facing consent
  // endpoints), so identity is backed by the same login every other
  // authenticated action in this app relies on, not by "whoever has the link."
  async sendStudentConsent(
    userId: string,
    applicationId: string,
    dto: SendStudentConsentDto,
  ) {
    const application = await this.getApplicationOrThrow(applicationId);
    if (!application.email) {
      throw new BadRequestException(
        'This application has no student email on file to send the consent request to.',
      );
    }
    // Consent can only be recorded from the student's own logged-in
    // dashboard, which requires a real account — applications with no
    // student user (e.g. some Initiator-created ones) can't use this.
    if (!application.userId) {
      throw new BadRequestException(
        'This application has no student account associated with it — consent cannot be requested.',
      );
    }

    const consent = await this.prisma.studentConsent.upsert({
      where: { applicationId },
      create: {
        applicationId,
        termsText: dto.termsText,
        createdByUserId: userId,
      },
      update: {
        termsText: dto.termsText,
        createdByUserId: userId,
        // A freshly (re)sent consent must be re-accepted, even if the
        // student had already consented to an earlier version of the terms.
        consentedAt: null,
        consentedIp: null,
      },
    });

    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const consentLink = `${frontendUrl}/dashboard/applications/${applicationId}`;

    await this.notifications.notifyStudentConsentRequested(
      application.userId,
      applicationId,
      application.applicationNumber ?? '',
      application.email,
      consentLink,
    );

    await this.audit.log(
      userId,
      AuditAction.STUDENT_CONSENT_SENT,
      { applicationNumber: application.applicationNumber },
      applicationId,
      AuditCategory.APPROVAL,
    );

    return { ...consent, consentLink };
  }

  async getSummary(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status,
      dsgir: application.dsgir,
      loanToValueRatio: application.loanToValueRatio,
      ciclStatus: application.personalGuarantee?.ciclStatus ?? null,
      ciclRemarks: application.personalGuarantee?.ciclRemarks ?? null,
      identityType: application.identityType,
      identityNumber: application.identityNumber,
      citizenshipNumber: application.citizenshipNumber,
      riskGrade: application.riskGrade,
      collateralText: application.securityDetails,
      insuranceAttached: Boolean(application.insurance),
      // Who approved each stage, and when — null for stages not yet completed.
      // creditManager mirrors checker: CREDIT_MANAGER is the current name for
      // the CHECKER role in this system (same person, same "check" action —
      // see dashboard/README.md), so it's derived rather than duplicated.
      approvals: {
        initiator: this.stageApprovalInfo(
          application.initiatorUserId,
          application.initiatorName,
          application.initiatorDate,
          application.initiatorPost,
          application.branch,
        ),
        supporter: this.stageApprovalInfo(
          application.supporterUserId,
          application.supporterName,
          application.supporterDate,
          application.supporterPost,
          application.supporterBranch,
        ),
        checker: this.stageApprovalInfo(
          application.checkerUserId,
          application.checkerName,
          application.checkerDate,
          application.checkerPost,
          application.checkerBranch,
        ),
        approver: this.stageApprovalInfo(
          application.approverUserId,
          application.approverName,
          application.approverDate,
          application.approverPost,
          application.approverBranch,
        ),
        creditManager: this.stageApprovalInfo(
          application.checkerUserId,
          application.checkerName,
          application.checkerDate,
          application.checkerPost,
          application.checkerBranch,
        ),
      },
    };
  }

  async getCreditScore(applicationId: string) {
    await this.getApplicationOrThrow(applicationId);
    return this.creditScore.calculateByApplicationId(applicationId);
  }

  async getNrbChecklist(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    // Derived, best-effort checklist — only items backed by real persisted
    // fields are booleans; everything else is explicitly marked "not tracked"
    // since there's no workflow/compliance-checklist model in this pass.
    return {
      applicationId: application.id,
      items: [
        {
          label: 'DSGIR within NRB limit',
          tracked: application.dsgir !== null,
          value: application.dsgir !== null ? application.dsgir <= 50 : null,
        },
        {
          label: 'LTV within NRB cap',
          tracked: application.loanToValueRatio !== null,
          value:
            application.loanToValueRatio !== null
              ? Number(application.loanToValueRatio) <= 60
              : null,
        },
        {
          label: 'CICL checked — no adverse',
          tracked: application.personalGuarantee?.ciclStatus !== undefined,
          value: application.personalGuarantee?.ciclStatus ?? null,
        },
        {
          label: 'Not blacklisted',
          tracked: application.isBlacklisted !== null,
          value:
            application.isBlacklisted !== null
              ? !application.isBlacklisted
              : null,
        },
        {
          label: 'Insurance attached',
          tracked: true,
          value: Boolean(application.insurance),
        },
        {
          label: 'PEP screening',
          tracked: application.pepStatus !== null,
          value: application.pepStatus !== null ? !application.pepStatus : null,
        },
        {
          label: 'NRB Rokka restriction check',
          tracked: false,
          value: null,
        },
      ],
    };
  }

  async getActivity(applicationId: string, query: PaginationDto) {
    await this.getApplicationOrThrow(applicationId);
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { applicationId },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where: { applicationId } }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
