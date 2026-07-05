import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { DashboardRepaymentService } from '../repayment/dashboard-repayment.service';
import {
  UserRole,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../../common/enums';
import { EMI_NOTIFICATION_TRIGGERS } from '../repayment/emi-notification-triggers.constant';

const SYSTEM_USER_EMAIL = 'system@genzloan.internal';

@Injectable()
export class DashboardJobsService {
  private readonly logger = new Logger(DashboardJobsService.name);
  private systemUserId: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly repayment: DashboardRepaymentService,
  ) {}

  private async getSystemUserId(): Promise<string> {
    if (this.systemUserId) return this.systemUserId;

    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
    const user = await this.prisma.user.upsert({
      where: { email: SYSTEM_USER_EMAIL },
      update: {},
      create: {
        email: SYSTEM_USER_EMAIL,
        passwordHash,
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },
    });
    this.systemUserId = user.id;
    return user.id;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyEmiJob() {
    const systemUserId = await this.getSystemUserId();

    const newlyOverdue = await this.repayment.markOverdueEntries(systemUserId);
    if (newlyOverdue.length > 0) {
      await this.notifyCreditManagersOfOverdue(newlyOverdue);
    }

    await this.sendDueReminders();

    this.logger.log(
      `Daily EMI job complete — ${newlyOverdue.length} entries marked overdue`,
    );
  }

  private async sendDueReminders() {
    for (const trigger of EMI_NOTIFICATION_TRIGGERS) {
      if (trigger.offsetDays === undefined) continue;

      const entries = await this.repayment.getEntriesDueForReminder(
        trigger.offsetDays,
      );
      for (const entry of entries) {
        const { application } = entry;
        if (!application) continue;

        const message = `Dear ${application.fullName ?? 'borrower'}, ${trigger.messageType}: EMI of ${Number(entry.emiAmount)} due ${entry.dueDate.toDateString()}.`;

        if (application.phoneNumber) {
          const sent = await this.notifications.sendSms(
            application.phoneNumber,
            message,
          );
          await this.notifications.sendWhatsapp(
            application.phoneNumber,
            message,
          );
          this.logger.debug(
            `Reminder "${trigger.trigger}" to ${application.phoneNumber}: ${sent ? 'sent' : 'skipped/failed'}`,
          );
        }
      }
    }
  }

  private async notifyCreditManagersOfOverdue(
    entries: Awaited<
      ReturnType<DashboardRepaymentService['markOverdueEntries']>
    >,
  ) {
    const creditManagers = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.CREDIT_MANAGER, UserRole.CHECKER] } },
      select: { id: true, email: true },
    });
    if (creditManagers.length === 0) return;

    const summary = `${entries.length} EMI installment(s) newly overdue.`;
    for (const manager of creditManagers) {
      await this.notifications.createDatabaseNotification(
        manager.id,
        'EMI overdue — action needed',
        summary,
        undefined,
        NotificationChannel.APP,
        NotificationDeliveryStatus.DELIVERED,
      );
    }
  }
}
