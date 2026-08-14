import { Module } from '@nestjs/common';
import { VerificationInvitationService } from './verification-invitation.service';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuditModule, NotificationsModule],
  providers: [VerificationInvitationService],
  exports: [VerificationInvitationService],
})
export class VerificationModule {}
