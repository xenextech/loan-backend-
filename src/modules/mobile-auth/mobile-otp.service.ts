import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, createHash } from 'crypto';
import { MobileOtpPurpose } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

@Injectable()
export class MobileOtpService {
  private readonly logger = new Logger(MobileOtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generates, stores, and dispatches a fresh 6-digit code for
   * (mobileUserId, purpose). Enforces a per-account resend cooldown on top of
   * the route's own IP-based throttle (see mobile-auth.controller.ts) — a
   * caller rotating IPs still can't re-trigger sends faster than this.
   *
   * Dispatched via email (existing SMTP) rather than SMS for now — Twilio
   * delivery to Nepali numbers isn't reliably wired up yet. phoneNumber is
   * still recorded on the OTP row so swapping back to
   * `notifications.sendSms(toE164(phoneNumber), ...)` later is a one-line
   * change, not a schema change.
   */
  async issue(
    mobileUserId: string,
    phoneNumber: string,
    email: string,
    purpose: MobileOtpPurpose,
  ): Promise<void> {
    const cooldownSeconds = this.config.get<number>(
      'otp.resendCooldownSeconds',
    )!;
    const latest = await this.prisma.mobileOtp.findFirst({
      where: { mobileUserId, purpose },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      const elapsedMs = Date.now() - latest.createdAt.getTime();
      if (elapsedMs < cooldownSeconds * 1000) {
        const waitSeconds = Math.ceil(
          (cooldownSeconds * 1000 - elapsedMs) / 1000,
        );
        throw new HttpException(
          `Please wait ${waitSeconds}s before requesting another code`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const ttlMinutes = this.config.get<number>('otp.ttlMinutes')!;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.mobileOtp.create({
      data: {
        mobileUserId,
        phoneNumber,
        codeHash: hashCode(code),
        purpose,
        expiresAt,
      },
    });

    const sent = await this.notifications.sendMobileOtpEmail(
      email,
      code,
      purpose,
      ttlMinutes,
    );
    if (!sent) {
      this.logger.warn(
        `OTP created but email dispatch failed for ${email} (${purpose})`,
      );
    }
  }

  /**
   * Verifies the most recent unconsumed code for (phoneNumber, purpose).
   * Consumes it on success (so it can never be reused) and locks it out
   * after too many wrong guesses within its own expiry window, rather than
   * a separate counter — a locked code is functionally just an early-expired
   * one, so the caller's only path forward is requesting a new one via
   * issue() once the resend cooldown clears.
   */
  async verify(
    mobileUserId: string,
    code: string,
    purpose: MobileOtpPurpose,
  ): Promise<void> {
    const maxAttempts = this.config.get<number>('otp.maxAttempts')!;
    const otp = await this.prisma.mobileOtp.findFirst({
      where: {
        mobileUserId,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('No active code found — request a new one');
    }
    if (otp.attempts >= maxAttempts) {
      throw new BadRequestException(
        'Too many incorrect attempts — request a new code',
      );
    }

    if (otp.codeHash !== hashCode(code)) {
      await this.prisma.mobileOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect or expired code');
    }

    await this.prisma.mobileOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
  }
}
