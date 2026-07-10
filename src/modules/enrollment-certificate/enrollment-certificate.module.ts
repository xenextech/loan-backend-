import { Module } from '@nestjs/common';
import { EnrollmentCertificateController } from './enrollment-certificate.controller';
import { EnrollmentCertificateService } from './enrollment-certificate.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EnrollmentCertificateController],
  providers: [EnrollmentCertificateService],
})
export class EnrollmentCertificateModule {}
