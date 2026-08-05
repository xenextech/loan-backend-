import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { CollegeService } from './college.service';
import { CourseService } from './course.service';
import { UniversityService } from './university.service';
import { AuditModule } from '../audit/audit.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuditModule, StorageModule],
  controllers: [MarketplaceController],
  providers: [CollegeService, CourseService, UniversityService],
  exports: [CollegeService, CourseService, UniversityService],
})
export class MarketplaceModule {}
