import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditAction, BankAccountOpeningStatus } from '../../common/enums';

/**
 * Gates the transition from "Parent + College verified" to "eligible for the
 * Initiator's queue" behind a Bank Account Opening step (see
 * ApplicationInitiatorService.getInitiatorQueue, which reads
 * bankAccountOpening.status === COMPLETED instead of college verification
 * alone).
 *
 * MVP note: `completeForApplication` is a self-reported completion — the
 * student clicks through to the partner bank's portal and tells us they're
 * done, there is no real bank API/webhook yet. That simulation is isolated
 * to this one method; everything else (the requirement record, the
 * Initiator-queue gate, the audit trail) is written the same way it would be
 * if a real webhook drove the completion, so swapping the trigger later
 * doesn't require touching the rest of the workflow.
 */
@Injectable()
export class BankAccountOpeningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertOwnedByUser(applicationId: string, userId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return application;
  }

  // Called after both the parent-verification and college-verification
  // submit handlers, from whichever side happens to complete second — safe
  // to call from both because it no-ops unless the OTHER side is also
  // already verified, and no-ops again if the requirement already exists
  // (upsert-free idempotency: a unique `applicationId` plus this find-first
  // check means a race between the two callers can create at most one row,
  // and even that duplicate attempt just hits the existing row and returns).
  async ensureRequirementIfBothVerified(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        userId: true,
        email: true,
        fullName: true,
        applicationNumber: true,
        parentVerification: { select: { submittedAt: true } },
        collegeVerification: { select: { isApplicationVerified: true } },
        bankAccountOpening: { select: { id: true } },
      },
    });
    if (!application) return;
    if (application.bankAccountOpening) return; // already created — idempotent
    const bothVerified =
      !!application.parentVerification?.submittedAt &&
      !!application.collegeVerification?.isApplicationVerified;
    if (!bothVerified) return;

    const bankUrl = this.config.get<string>('bankAccountOpening.url')!;

    await this.prisma.bankAccountOpening.create({
      data: { applicationId, bankUrl, notifiedAt: new Date() },
    });

    await this.audit.log(
      application.userId ?? '',
      AuditAction.BANK_ACCOUNT_OPENING_REQUIRED,
      { applicationNumber: application.applicationNumber },
      applicationId,
    );

    await this.notifications.notifyBankAccountOpeningRequired({
      userId: application.userId,
      email: application.email,
      applicationId,
      applicationNumber: application.applicationNumber,
      fullName: application.fullName,
      bankUrl,
    });
  }

  // Null (not 404) when no requirement has been created yet — the parent/
  // college steps aren't both done, so there's nothing to show. Mirrors
  // ApplicationsService.getMyConsent's "no consent sent yet" shape.
  async getForApplication(applicationId: string, userId: string) {
    await this.assertOwnedByUser(applicationId, userId);
    return this.prisma.bankAccountOpening.findUnique({
      where: { applicationId },
    });
  }

  // Idempotent: a second (or twentieth) click after completion just returns
  // the already-completed record — no duplicate audit entry, no duplicate
  // notification, no re-transition. The backend is the sole source of truth
  // for this flip; the frontend button is not trusted to only be clickable once.
  async completeForApplication(applicationId: string, userId: string) {
    const application = await this.assertOwnedByUser(applicationId, userId);
    const existing = await this.prisma.bankAccountOpening.findUnique({
      where: { applicationId },
    });
    if (!existing) {
      throw new NotFoundException(
        'No bank account opening requirement is pending for this application.',
      );
    }
    if (existing.status === BankAccountOpeningStatus.COMPLETED) {
      return existing;
    }

    const completed = await this.prisma.bankAccountOpening.update({
      where: { applicationId },
      data: {
        status: BankAccountOpeningStatus.COMPLETED,
        clickedAt: existing.clickedAt ?? new Date(),
        completedAt: new Date(),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.BANK_ACCOUNT_OPENING_COMPLETED,
      { applicationNumber: application.applicationNumber },
      applicationId,
    );

    return completed;
  }
}
