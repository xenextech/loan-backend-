import { Module } from '@nestjs/common';
import { BankAccountOpeningController } from './bank-account-opening.controller';
import { BankAccountOpeningService } from './bank-account-opening.service';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuditModule, NotificationsModule],
  controllers: [BankAccountOpeningController],
  providers: [BankAccountOpeningService],
  exports: [BankAccountOpeningService],
})
export class BankAccountOpeningModule {}
