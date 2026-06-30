import { Module } from '@nestjs/common';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StorageModule, AuditModule],
  controllers: [CollegeController],
  providers: [CollegeService],
})
export class CollegeModule {}
