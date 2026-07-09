import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../common/enums';
import { RepaymentFrequency } from '@prisma/client';

const FREQUENCY_LABEL: Record<RepaymentFrequency, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;
  private twilioClient: Twilio | null;

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

    const accountSid = this.config.get<string>('twilio.accountSid');
    const authToken = this.config.get<string>('twilio.authToken');
    this.twilioClient =
      accountSid && authToken ? new Twilio(accountSid, authToken) : null;
  }

  // ── Database notification ──────────────────────────────────────────────────
  async createDatabaseNotification(
    userId: string,
    title: string,
    message: string,
    applicationId?: string,
    channel?: NotificationChannel,
    deliveryStatus?: NotificationDeliveryStatus,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        applicationId,
        type: NotificationType.DATABASE,
        channel,
        deliveryStatus,
      },
    });
  }

  // ── Application rejected ───────────────────────────────────────────────────
  async notifyApplicationRejected(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
        email: true,
        phoneNumber: true,
        applicationNumber: true,
        rejectionReason: true,
      },
    });
    if (!application) return;

    const title = 'Loan Application Rejected';
    const message = `Your education loan application ${application.applicationNumber ?? ''} has been rejected. Reason: ${application.rejectionReason ?? 'Not specified'}.`;

    if (application.userId) {
      await this.createDatabaseNotification(
        application.userId,
        title,
        message,
        applicationId,
      );
    }
    if (application.email) {
      await this.sendEmail(application.email, title, `<p>${message}</p>`);
    }
    if (application.phoneNumber) {
      await this.sendSms(application.phoneNumber, message);
    }
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
    await this.sendApplicationSubmittedEmail(
      email,
      applicationNumber,
      parentLink,
      collegeLink,
    );
  }

  // ── Loan servicing finalized (student + parent) ─────────────────────────────
  // Composes one message from the Credit Manager's finalized configuration and
  // fans it out across whichever channels are actually available. Parents have
  // no User account (ParentVerification has no userId/email), so their copy can
  // only ever be delivered live via SMS/WhatsApp — never persisted as a
  // Notification row, which is why parentNotified/parentChannel are returned
  // separately rather than assumed.
  async notifyLoanFinalized(params: {
    userId?: string | null;
    applicationId: string;
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    parentPhone?: string | null;
    approvedAmount: number;
    disbursementAmount: number;
    interestRate: number;
    emiAmount: number;
    tenureMonths: number;
    repaymentFrequency: RepaymentFrequency;
    gracePeriodMonths: number;
    firstDueDate: Date;
    totalRepayable: number;
    // Full installment breakdown — rendered as a table in the email only
    // (SMS/WhatsApp/app copies stay a summary; a full schedule doesn't fit
    // those channels).
    schedule?: {
      installmentNumber: number;
      dueDate: Date;
      emiAmount: number;
      principalComponent: number;
      interestComponent: number;
    }[];
  }): Promise<{
    studentNotified: boolean;
    parentNotified: boolean;
    parentChannel: 'SMS' | 'WHATSAPP' | null;
  }> {
    const title = 'Your loan has been finalized';
    const frequencyLabel = FREQUENCY_LABEL[params.repaymentFrequency];
    const message =
      `Dear ${params.fullName ?? 'borrower'}, your loan has been finalized by our Credit Management team. ` +
      `Approved Loan Amount: ${params.approvedAmount}. Disbursement Amount: ${params.disbursementAmount}. Interest Rate: ${params.interestRate}%. ` +
      `EMI Amount: ${params.emiAmount}. EMI Timeline: ${frequencyLabel}. Tenure: ${params.tenureMonths} month(s). ` +
      `Grace Period: ${params.gracePeriodMonths} month(s). First EMI Due Date: ${params.firstDueDate.toDateString()}. ` +
      `Total Repayable Amount: ${params.totalRepayable}. Please pay each installment on or before its due date to avoid penal interest charges.` +
      (params.schedule?.length
        ? ' Your full installment-by-installment repayment schedule is attached in the email sent to you.'
        : '');

    let studentNotified = false;
    if (params.userId) {
      await this.createDatabaseNotification(
        params.userId,
        title,
        message,
        params.applicationId,
        NotificationChannel.APP,
        NotificationDeliveryStatus.SENT,
      );
      studentNotified = true;
    }
    if (params.email) {
      const scheduleHtml = params.schedule?.length
        ? this.buildEmiScheduleTableHtml(params.schedule)
        : '';
      await this.sendEmail(
        params.email,
        title,
        `<p>${message}</p>${scheduleHtml}`,
      );
    }
    if (params.phoneNumber) {
      await this.sendSms(params.phoneNumber, message);
    }

    let parentNotified = false;
    let parentChannel: 'SMS' | 'WHATSAPP' | null = null;
    if (params.parentPhone) {
      const parentMessage = `Dear Parent/Guardian, ${message}`;
      const smsSent = await this.sendSms(params.parentPhone, parentMessage);
      const waSent = await this.sendWhatsapp(params.parentPhone, parentMessage);
      parentNotified = smsSent || waSent;
      parentChannel = smsSent ? 'SMS' : waSent ? 'WHATSAPP' : null;
    }

    return { studentNotified, parentNotified, parentChannel };
  }

  // ── Loan cleared (student + parent) ─────────────────────────────────────
  async notifyLoanCleared(params: {
    userId?: string | null;
    applicationId: string;
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    parentPhone?: string | null;
    remarks?: string;
  }): Promise<{
    studentNotified: boolean;
    parentNotified: boolean;
    parentChannel: 'SMS' | 'WHATSAPP' | null;
  }> {
    const title = 'Your loan has been fully cleared';
    const message =
      `Dear ${params.fullName ?? 'borrower'}, congratulations — your education loan has been fully repaid and is now closed. ` +
      `No further installments are due.` +
      (params.remarks ? ` Note: ${params.remarks}` : '');

    let studentNotified = false;
    if (params.userId) {
      await this.createDatabaseNotification(
        params.userId,
        title,
        message,
        params.applicationId,
        NotificationChannel.APP,
        NotificationDeliveryStatus.SENT,
      );
      studentNotified = true;
    }
    if (params.email) {
      await this.sendEmail(params.email, title, `<p>${message}</p>`);
    }
    if (params.phoneNumber) {
      await this.sendSms(params.phoneNumber, message);
    }

    let parentNotified = false;
    let parentChannel: 'SMS' | 'WHATSAPP' | null = null;
    if (params.parentPhone) {
      const parentMessage = `Dear Parent/Guardian, ${message}`;
      const smsSent = await this.sendSms(params.parentPhone, parentMessage);
      const waSent = await this.sendWhatsapp(params.parentPhone, parentMessage);
      parentNotified = smsSent || waSent;
      parentChannel = smsSent ? 'SMS' : waSent ? 'WHATSAPP' : null;
    }

    return { studentNotified, parentNotified, parentChannel };
  }

  private buildEmiScheduleTableHtml(
    schedule: {
      installmentNumber: number;
      dueDate: Date;
      emiAmount: number;
      principalComponent: number;
      interestComponent: number;
    }[],
  ) {
    const rows = schedule
      .map(
        (e) => `
        <tr>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;">${e.installmentNumber}</td>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;">${e.dueDate.toDateString()}</td>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;">${e.emiAmount}</td>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;">${e.principalComponent}</td>
          <td style="padding:6px 10px;border:1px solid #E5E7EB;">${e.interestComponent}</td>
        </tr>`,
      )
      .join('');

    return `
      <h3>Full Repayment Schedule</h3>
      <table style="border-collapse:collapse;font-size:13px;">
        <thead>
          <tr>
            <th style="padding:6px 10px;border:1px solid #E5E7EB;text-align:left;">#</th>
            <th style="padding:6px 10px;border:1px solid #E5E7EB;text-align:left;">Due Date</th>
            <th style="padding:6px 10px;border:1px solid #E5E7EB;text-align:left;">EMI Amount</th>
            <th style="padding:6px 10px;border:1px solid #E5E7EB;text-align:left;">Principal</th>
            <th style="padding:6px 10px;border:1px solid #E5E7EB;text-align:left;">Interest</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // ── Email helpers ──────────────────────────────────────────────────────────
  async sendEmailVerification(email: string, token: string) {
    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/auth/verify-email?token=${token}`;

    await this.sendEmail(
      email,
      'Verify your Unnati Loan account',
      `
      <h2>Welcome to Unnati Loan!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
    );
  }

  async sendPasswordReset(email: string, token: string) {
    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const link = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendEmail(
      email,
      'Reset your Unnati Loan password',
      `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${link}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
    );
  }

  async sendApplicationSubmittedEmail(
    email: string,
    applicationNumber: string,
    parentLink: string,
    collegeLink: string,
  ) {
    await this.sendEmail(
      email,
      'Your loan application has been submitted — Unnati Loan',
      `
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
      <p>Thank you for choosing Unnati Loan.</p>
    `,
    );
  }

  async sendParentVerificationLink(
    email: string,
    applicationNumber?: string,
    parentLink?: string,
  ) {
    await this.sendEmail(
      email,
      `Action required: Verify loan application ${applicationNumber}`,
      `
      <h2>Education Loan Application — Parent/Guardian Verification</h2>
      <p>A student has submitted an education loan application <strong>${applicationNumber}</strong> and has listed you as their parent or guardian.</p>
      <p>Please click the button below to view the application details:</p>
      <a href="${parentLink}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Application</a>
      <p style="margin-top:16px;font-size:13px;color:#6B7280;">This link is valid for 3 days. If you were not expecting this email, you can safely ignore it.</p>
      <p>Thank you,<br/>Unnati Loan Team</p>
    `,
    );
  }

  async sendCollegeVerificationLink(
    email: string,
    applicationNumber: string,
    collegeLink: string,
  ) {
    await this.sendEmail(
      email,
      `Action required: Education loan verification for application ${applicationNumber}`,
      `
      <h2>Education Loan — College/Institution Verification</h2>
      <p>A student has submitted an education loan application <strong>${applicationNumber}</strong> and has listed your institution.</p>
      <p>Please click the button below to complete the verification — you will need to upload the offer letter and enrollment documents:</p>
      <a href="${collegeLink}" style="background:#0D9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Complete College Verification</a>
      <p style="margin-top:16px;font-size:13px;color:#6B7280;">This link is valid for 3 days. If you were not expecting this email, you can safely ignore it.</p>
      <p>Thank you,<br/>Unnati Loan Team</p>
    `,
    );
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

  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.warn(`Twilio not configured — skipping SMS to ${to}`);
      return false;
    }
    try {
      await this.twilioClient.messages.create({
        from: this.config.get<string>('twilio.phoneNumber'),
        to,
        body,
      });
      return true;
    } catch (err) {
      this.logger.warn(`Failed to send SMS to ${to}: ${String(err)}`);
      return false;
    }
  }

  async sendWhatsapp(to: string, body: string): Promise<boolean> {
    if (!this.twilioClient) {
      this.logger.warn(`Twilio not configured — skipping WhatsApp to ${to}`);
      return false;
    }
    const whatsappNumber = this.config.get<string>('twilio.whatsappNumber');
    try {
      await this.twilioClient.messages.create({
        from: `whatsapp:${whatsappNumber}`,
        to: `whatsapp:${to}`,
        body,
      });
      return true;
    } catch (err) {
      this.logger.warn(`Failed to send WhatsApp to ${to}: ${String(err)}`);
      return false;
    }
  }
}
