import { Module } from '@nestjs/common';
import { ParentPublicController } from './parent-public.controller';
import { ParentPublicService } from './parent-public.service';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';
import { VerificationModule } from '../verification/verification.module';
import { BankAccountOpeningModule } from '../bank-account/bank-account-opening.module';

@Module({
  imports: [
    StorageModule,
    AuditModule,
    VerificationModule,
    BankAccountOpeningModule,
  ],
  controllers: [ParentPublicController],
  providers: [ParentPublicService],
})
export class ParentPublicModule {}
