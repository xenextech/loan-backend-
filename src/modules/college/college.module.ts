import { Module } from '@nestjs/common';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
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
  controllers: [CollegeController],
  providers: [CollegeService],
})
export class CollegeModule {}
