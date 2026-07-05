import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../notifications/notifications.module';
import { DashboardModule } from '../dashboard.module';
import { DashboardJobsService } from './dashboard-jobs.service';

@Module({
  imports: [NotificationsModule, DashboardModule],
  providers: [DashboardJobsService],
})
export class DashboardJobsModule {}
