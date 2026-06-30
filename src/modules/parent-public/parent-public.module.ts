import { Module } from '@nestjs/common';
import { ParentPublicController } from './parent-public.controller';
import { ParentPublicService } from './parent-public.service';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StorageModule, AuditModule],
  controllers: [ParentPublicController],
  providers: [ParentPublicService],
})
export class ParentPublicModule {}
