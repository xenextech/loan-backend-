import { Module } from '@nestjs/common';
import { DocumentVaultController } from './document-vault.controller';
import { DocumentVaultService } from './document-vault.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [DocumentVaultController],
  providers: [DocumentVaultService],
})
export class DocumentVaultModule {}
