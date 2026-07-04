import { PartialType } from '@nestjs/swagger';
import { CreateEnrollmentCertificateDto } from './create-enrollment-certificate.dto';

export class UpdateEnrollmentCertificateDto extends PartialType(
  CreateEnrollmentCertificateDto,
) {}
