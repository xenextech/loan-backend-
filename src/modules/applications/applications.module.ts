import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationTrackerService } from './application-tracker.service';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [AuditModule, NotificationsModule, DashboardModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationTrackerService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
