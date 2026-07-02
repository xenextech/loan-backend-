import { Module } from '@nestjs/common';
import {
  ApplicationInitiatorController,
  ApplicationInitiatorListController,
} from './application-initiator.controller';
import { ApplicationInitiatorService } from './application-initiator.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [
    ApplicationInitiatorController,
    ApplicationInitiatorListController,
  ],
  providers: [ApplicationInitiatorService],
  exports: [ApplicationInitiatorService],
})
export class ApplicationInitiatorModule {}
