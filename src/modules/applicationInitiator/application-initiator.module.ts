import { Module } from '@nestjs/common';
import {
  ApplicationInitiatorController,
  ApplicationInitiatorListController,
} from './application-initiator.controller';
import { ApplicationInitiatorService } from './application-initiator.service';
import { AuditModule } from '../audit/audit.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [AuditModule, ApplicationsModule],
  controllers: [
    ApplicationInitiatorController,
    ApplicationInitiatorListController,
  ],
  providers: [ApplicationInitiatorService],
  exports: [ApplicationInitiatorService],
})
export class ApplicationInitiatorModule {}
