import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/enums';
import { CreateInitiatorApplicationDto } from './dto/create-initiator-application.dto';
import { UpdateInitiatorApplicationDto } from './dto/update-initiator-application.dto';

@Injectable()
export class ApplicationInitiatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async assertApplicationExists(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // ── Combined initiator sections, merged directly onto LoanApplication ──────

  async createInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: CreateInitiatorApplicationDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);
    if (application.relationshipStartDate) {
      throw new ConflictException(
        'Initiator information already exists for this application. Use PATCH to update it.',
      );
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...dto,
      } as any,
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { section: 'initiator', action: 'create' },
      applicationId,
    );
    return updated;
  }

  async updateInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: UpdateInitiatorApplicationDto,
  ) {
    await this.assertApplicationExists(applicationId);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...dto,
      } as any,
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { section: 'initiator', action: 'update' },
      applicationId,
    );
    return updated;
  }
}
