import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '../../common/enums';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('smtp.host'),
      port: this.config.get<number>('smtp.port') ?? 587,
      secure: false,
      auth: {
        user: this.config.get<string>('smtp.user'),
        pass: this.config.get<string>('smtp.pass'),
      },
    });
  }

  // ── Database notification ──────────────────────────────────────────────────
  async createDatabaseNotification(
    userId: string,
    title: string,
    message: string,
    applicationId?: string,
  ) {
    return this.prisma.notification.create({
      data: { userId, title, message, applicationId, type: NotificationType.DATABASE },
    });
  }

  // ── Application submitted ──────────────────────────────────────────────────
  async notifyApplicationSubmitted(userId: string, applicationNumber: string, email: string) {
    const title = 'Application Submitted Successfully';
    const message = `Your education loan application ${applicationNumber} has been successfully submitted. Our team will review it within 3-5 business days.`;

    await this.createDatabaseNotification(userId, title, message);
    await this.sendApplicationSubmittedEmail(email, applicationNumber);
  }

  // ── Email helpers ──────────────────────────────────────────────────────────
  async sendEmailVerification(email: string, token: string) {
    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/auth/verify-email?token=${token}`;

    await this.sendEmail(email, 'Verify your Cliq Edu Loan account', `
      <h2>Welcome to Cliq Edu Loan!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `);
  }

  async sendPasswordReset(email: string, token: string) {
    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendEmail(email, 'Reset your Cliq Edu Loan password', `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `);
  }

  async sendApplicationSubmittedEmail(email: string, applicationNumber: string) {
    await this.sendEmail(email, 'Your loan application has been submitted — Cliq Edu Loan', `
      <h2>Application Submitted!</h2>
      <p>Your education loan application <strong>${applicationNumber}</strong> has been successfully submitted.</p>
      <p>Our loan officers will review your application within 3-5 business days. You will be notified of any updates.</p>
      <p>Thank you for choosing Cliq Edu Loan.</p>
    `);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('smtp.from'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.warn(`Failed to send email to ${to}: ${String(err)}`);
    }
  }
}
