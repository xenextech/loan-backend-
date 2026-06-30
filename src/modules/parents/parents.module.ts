import { Module } from '@nestjs/common';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ParentsController],
  providers: [ParentsService],
})
export class ParentsModule {}
