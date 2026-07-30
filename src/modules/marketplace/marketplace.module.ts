import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { CollegeService } from './college.service';
import { CourseService } from './course.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [MarketplaceController],
  providers: [CollegeService, CourseService],
  exports: [CollegeService, CourseService],
})
export class MarketplaceModule {}
