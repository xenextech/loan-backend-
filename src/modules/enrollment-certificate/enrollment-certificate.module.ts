import { Module } from '@nestjs/common';
import { EnrollmentCertificateController } from './enrollment-certificate.controller';
import { EnrollmentCertificateService } from './enrollment-certificate.service';

@Module({
  controllers: [EnrollmentCertificateController],
  providers: [EnrollmentCertificateService],
})
export class EnrollmentCertificateModule {}
