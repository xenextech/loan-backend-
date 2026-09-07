import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplicationLinkType, AuditAction } from '../../common/enums';
import {
  generateVerificationToken,
  hashVerificationToken,
  generateVerificationCode,
} from '../../common/utils/verification-token.util';

export interface VerificationInvitationView {
  email: string;
  verificationCode: string;
  status: 'PENDING' | 'OPENED' | 'VERIFIED' | 'EXPIRED' | 'REVOKED' | 'FAILED';
  sentAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
}

type RecipientType = 'PARENT' | 'COLLEGE';

// Shared invitation lifecycle for both PARENT and COLLEGE verification —
// separate invitations per recipient type, never a shared token (each
// createAndSend call mints its own token + code bound to one linkType).
@Injectable()
export class VerificationInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertOwnedApplication(applicationId: string, userId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return application;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async findActive(applicationId: string, linkType: RecipientType) {
    return this.prisma.applicationLink.findFirst({
      where: {
        applicationId,
        linkType: linkType as ApplicationLinkType,
        status: { in: ['SENT', 'OPENED'] },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findLatest(applicationId: string, linkType: RecipientType) {
    return this.prisma.applicationLink.findFirst({
      where: { applicationId, linkType: linkType as ApplicationLinkType },
      orderBy: { createdAt: 'desc' },
    });
  }

  private toSafeView(
    link: {
      recipientEmail: string | null;
      verificationCode: string | null;
      status: string;
      createdAt: Date;
      expiresAt: Date;
      verifiedAt: Date | null;
    } | null,
  ): VerificationInvitationView | null {
    if (!link) return null;

    let status: VerificationInvitationView['status'];
    if (link.status === 'VERIFIED') status = 'VERIFIED';
    else if (link.status === 'REVOKED') status = 'REVOKED';
    else if (link.status === 'FAILED') status = 'FAILED';
    else if (link.expiresAt < new Date()) status = 'EXPIRED';
    else if (link.status === 'OPENED') status = 'OPENED';
    else status = 'PENDING';

    return {
      email: link.recipientEmail ?? '',
      verificationCode: link.verificationCode ?? '',
      status,
      sentAt: link.createdAt,
      expiresAt: link.expiresAt,
      verifiedAt: link.verifiedAt,
    };
  }

  private async generateUniqueCode(linkType: RecipientType): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateVerificationCode(linkType);
      const existing = await this.prisma.applicationLink.findUnique({
        where: { verificationCode: code },
      });
      if (!existing) return code;
    }
    throw new Error('Failed to generate a unique verification code');
  }

  private async revoke(
    link: { id: string; applicationId: string },
    linkType: RecipientType,
    userId: string,
    reason: string,
  ) {
    await this.prisma.applicationLink.update({
      where: { id: link.id },
      data: { status: 'REVOKED', revokedAt: new Date(), token: null },
    });
    await this.audit.log(
      userId,
      AuditAction.VERIFICATION_INVITATION_REVOKED,
      { recipientType: linkType, reason },
      link.applicationId,
    );
  }

  private async createAndSend(
    applicationId: string,
    application: {
      applicationNumber: string | null;
      userId: string | null;
    },
    linkType: RecipientType,
    email: string,
    auditAction: AuditAction,
  ): Promise<VerificationInvitationView> {
    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken);
    const verificationCode = await this.generateUniqueCode(linkType);
    const ttlMs = this.config.get<number>('verification.linkTtlMs')!;
    const expiresAt = new Date(Date.now() + ttlMs);

    const link = await this.prisma.applicationLink.create({
      data: {
        token: rawToken,
        tokenHash,
        verificationCode,
        applicationId,
        linkType: linkType as ApplicationLinkType,
        recipientEmail: email,
        expiresAt,
        status: 'SENT',
      },
    });

    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const path = linkType === 'PARENT' ? 'parent-verify' : 'college-verify';
    const verifyLink = `${frontendUrl}/${path}/${rawToken}`;
    const applicationNumber = application.applicationNumber ?? '';

    const sent =
      linkType === 'PARENT'
        ? await this.notifications.sendParentVerificationLink(
            email,
            applicationNumber,
            verifyLink,
            verificationCode,
            expiresAt,
          )
        : await this.notifications.sendCollegeVerificationLink(
            email,
            applicationNumber,
            verifyLink,
            verificationCode,
            expiresAt,
          );

    let finalStatus: 'SENT' | 'FAILED' = 'SENT';
    if (!sent) {
      finalStatus = 'FAILED';
      await this.prisma.applicationLink.update({
        where: { id: link.id },
        data: { status: 'FAILED' },
      });
    }

    await this.audit.log(
      application.userId ?? '',
      auditAction,
      { recipientType: linkType, verificationCode, emailSent: sent },
      applicationId,
    );

    return this.toSafeView({ ...link, status: finalStatus })!;
  }

  // ── Send: create-if-none-active, revoke+recreate on email change ──────────
  async send(
    applicationId: string,
    userId: string,
    linkType: RecipientType,
    rawEmail: string,
  ): Promise<VerificationInvitationView> {
    const application = await this.assertOwnedApplication(
      applicationId,
      userId,
    );
    const email = this.normalizeEmail(rawEmail);
    const active = await this.findActive(applicationId, linkType);

    if (active) {
      if (active.recipientEmail?.toLowerCase() === email) {
        throw new ConflictException(
          'A verification invitation is already pending for this recipient. Use resend to send a new one.',
        );
      }
      // Recipient email changed — the previous invitation must no longer work.
      await this.revoke(active, linkType, userId, 'Recipient email changed');
    }

    return this.createAndSend(
      applicationId,
      application,
      linkType,
      email,
      AuditAction.VERIFICATION_INVITATION_CREATED,
    );
  }

  // ── Resend: always revokes the previous token and mints a fresh one ───────
  async resend(
    applicationId: string,
    userId: string,
    linkType: RecipientType,
  ): Promise<VerificationInvitationView> {
    const application = await this.assertOwnedApplication(
      applicationId,
      userId,
    );
    const latest = await this.findLatest(applicationId, linkType);
    if (!latest || !latest.recipientEmail) {
      throw new NotFoundException(
        'No verification invitation found to resend — send one first.',
      );
    }

    if (latest.status === 'SENT' || latest.status === 'OPENED') {
      await this.revoke(latest, linkType, userId, 'Resent by initiator');
    }

    return this.createAndSend(
      applicationId,
      application,
      linkType,
      latest.recipientEmail,
      AuditAction.VERIFICATION_INVITATION_RESENT,
    );
  }

  // ── Status: what the initiator is allowed to see (never token/tokenHash) ──
  async getStatus(applicationId: string, userId: string) {
    await this.assertOwnedApplication(applicationId, userId);
    const [parent, college] = await Promise.all([
      this.findLatest(applicationId, 'PARENT'),
      this.findLatest(applicationId, 'COLLEGE'),
    ]);
    return {
      parent: this.toSafeView(parent),
      college: this.toSafeView(college),
    };
  }

  // ── Recipient-side resolution used by parent-public / college controllers ─
  async resolveInvitation(
    rawToken: string,
    email: string | undefined,
    linkType: RecipientType,
  ) {
    const tokenHash = hashVerificationToken(rawToken);
    const include = {
      application: {
        include: { studyInformation: true, loanInformation: true },
      },
    } as const;

    let link = await this.prisma.applicationLink.findUnique({
      where: { tokenHash },
      include,
    });

    // Legacy fallback: rows created before this feature have no tokenHash.
    if (!link) {
      link = await this.prisma.applicationLink.findUnique({
        where: { token: rawToken },
        include,
      });
    }

    if (!link || link.linkType !== linkType) {
      throw new NotFoundException('Invalid link');
    }
    if (link.status === 'REVOKED') {
      throw new BadRequestException(
        'This verification link has been revoked. Please request a new one.',
      );
    }
    if (link.expiresAt < new Date()) {
      throw new BadRequestException('This verification link has expired');
    }

    // Legacy rows never captured a recipient email — skip the check for them
    // rather than locking out links that predate this feature.
    if (link.recipientEmail) {
      const normalized = email?.trim().toLowerCase();
      if (!normalized || normalized !== link.recipientEmail.toLowerCase()) {
        await this.logRecipientAudit(link, AuditAction.VERIFICATION_FAILED, {
          recipientType: linkType,
          reason: 'email_mismatch',
        });
        throw new BadRequestException(
          'The email address does not match this invitation.',
        );
      }
    }

    if (!link.accessedAt) {
      await this.prisma.applicationLink.update({
        where: { id: link.id },
        data: {
          accessedAt: new Date(),
          status: link.status === 'SENT' ? 'OPENED' : link.status,
        },
      });
      await this.logRecipientAudit(
        link,
        AuditAction.VERIFICATION_LINK_ACCESSED,
        { recipientType: linkType },
      );
    }

    return link;
  }

  // These two audit calls happen on the recipient's (anonymous, unauthenticated)
  // side of the flow — there's no logged-in user to attribute them to, only the
  // application's owner. AuditLog.userId is a required FK to User, so passing ''
  // throws a Prisma P2003 (foreign key violation) that the global exception
  // filter turns into a generic "Invalid data provided" 400 — which previously
  // broke the *whole* request here, even after the real work (e.g. marking the
  // link accessedAt) had already committed. That's exactly what made the first
  // visit/attempt appear to fail while an identical retry then succeeded (the
  // update was already done, so the accessedAt branch — and its audit call —
  // was skipped the second time). Audit logging is inherently best-effort, so
  // it must never be able to fail the actual verification request.
  private async logRecipientAudit(
    link: { applicationId: string; application: { userId: string | null } },
    action: AuditAction,
    payload: Record<string, unknown>,
  ) {
    const actorUserId = link.application.userId;
    if (!actorUserId) return;
    try {
      await this.audit.log(actorUserId, action, payload, link.applicationId);
    } catch {
      // Never let an audit-log failure surface as a failure of the actual
      // verification request — it has already succeeded by this point.
    }
  }

  // Marks the invitation VERIFIED once the recipient submits their form.
  // Deliberately does NOT null the raw token or block further resolution —
  // both flows let the recipient keep uploading documents after their first
  // submission (existing UX), so full single-use would break that. The
  // token IS invalidated (nulled) the moment it's superseded by a resend or
  // an email change, which is where "single-use" carries real weight here.
  async markVerified(linkId: string) {
    await this.prisma.applicationLink.update({
      where: { id: linkId },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
  }
}
