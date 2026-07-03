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
  async notifyApplicationSubmitted(
    userId: string,
    applicationNumber: string,
    email: string,
    parentLink: string,
    collegeLink: string,
  ) {
    const title = 'Application Submitted Successfully';
    const message = `Your education loan application ${applicationNumber} has been successfully submitted. Our team will review it within 3-5 business days.`;

    await this.createDatabaseNotification(userId, title, message);
    await this.sendApplicationSubmittedEmail(email, applicationNumber, parentLink, collegeLink);
  }

  // ── Email helpers ──────────────────────────────────────────────────────────
  async sendEmailVerification(email: string, token: string) {
    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/auth/verify-email?token=${token}`;

    await this.sendEmail(email, 'Verify your GenZ Loan account', `
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

    await this.sendEmail(email, 'Reset your GenZ Loan password', `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `);
  }

  async sendApplicationSubmittedEmail(
    email: string,
    applicationNumber: string,
    parentLink: string,
    collegeLink: string,
  ) {
    await this.sendEmail(email, 'Your loan application has been submitted — GenZ Loan', `
      <h2>Application Submitted!</h2>
      <p>Your education loan application <strong>${applicationNumber}</strong> has been successfully submitted.</p>
      <p>Our loan officers will review your application within 3-5 business days. You will be notified of any updates.</p>
      <hr />
      <h3>Share these links</h3>
      <p><strong>Parent verification link</strong> — share this with your parent/guardian so they can view the application:</p>
      <a href="${parentLink}" style="background:#4F46E5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-bottom:12px;">Parent Verification Link</a>
      <p><strong>College verification link</strong> — share this with your institution so they can upload the required documents:</p>
      <a href="${collegeLink}" style="background:#0D9488;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">College Verification Link</a>
      <p style="margin-top:16px;font-size:13px;color:#6B7280;">Both links are valid for 3 days. Keep them confidential.</p>
      <p>Thank you for choosing GenZ Loan.</p>
    `);
  }

  async sendParentVerificationLink(email: string, applicationNumber?: string, parentLink?: string) {
    await this.sendEmail(email, `Action required: Verify loan application ${applicationNumber}`, `
      <h2>Education Loan Application — Parent/Guardian Verification</h2>
      <p>A student has submitted an education loan application <strong>${applicationNumber}</strong> and has listed you as their parent or guardian.</p>
      <p>Please click the button below to view the application details:</p>
      <a href="${parentLink}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Application</a>
      <p style="margin-top:16px;font-size:13px;color:#6B7280;">This link is valid for 3 days. If you were not expecting this email, you can safely ignore it.</p>
      <p>Thank you,<br/>GenZ Loan Team</p>
    `);
  }

  async sendCollegeVerificationLink(email: string, applicationNumber: string, collegeLink: string) {
    await this.sendEmail(email, `Action required: Education loan verification for application ${applicationNumber}`, `
      <h2>Education Loan — College/Institution Verification</h2>
      <p>A student has submitted an education loan application <strong>${applicationNumber}</strong> and has listed your institution.</p>
      <p>Please click the button below to complete the verification — you will need to upload the offer letter and enrollment documents:</p>
      <a href="${collegeLink}" style="background:#0D9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Complete College Verification</a>
      <p style="margin-top:16px;font-size:13px;color:#6B7280;">This link is valid for 3 days. If you were not expecting this email, you can safely ignore it.</p>
      <p>Thank you,<br/>GenZ Loan Team</p>
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
