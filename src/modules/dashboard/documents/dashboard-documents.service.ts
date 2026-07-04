import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { VerifyOfferLetterDto } from '../dto/offer-letter-verify.dto';
import { DocumentVaultQueryDto } from '../dto/document-vault-query.dto';
import {
  CreateGeneratedAgreementDto,
  GeneratedAgreementQueryDto,
} from '../dto/generated-agreement.dto';

@Injectable()
export class DashboardDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async verifyOfferLetter(userId: string, dto: VerifyOfferLetterDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: dto.applicationId },
      include: { collegeVerification: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const offerLetter = await this.prisma.offerLetter.findFirst({
      where: {
        OR: [{ refNo: dto.refOrQrToken }, { qrToken: dto.refOrQrToken }],
      },
    });

    if (!offerLetter || !application.collegeVerification) {
      return { matched: false, offerLetter: null, verification: null };
    }

    const verification = await this.prisma.collegeVerification.update({
      where: { applicationId: dto.applicationId },
      data: {
        offerLetterVerified: true,
        offerLetterVerifiedAt: new Date(),
        offerLetterVerifiedByUserId: userId,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.OFFER_LETTER_VERIFIED,
      { refOrQrToken: dto.refOrQrToken },
      dto.applicationId,
      AuditCategory.SYSTEM,
    );

    return { matched: true, offerLetter, verification };
  }

  async getVault(query: DocumentVaultQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.documentType ? { documentType: query.documentType } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        take,
        skip,
        orderBy: { uploadedAt: 'desc' },
        include: {
          application: {
            select: { id: true, applicationNumber: true, fullName: true },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async listAgreements(query: GeneratedAgreementQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = query.applicationId
      ? { applicationId: query.applicationId }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.generatedAgreement.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            select: { id: true, applicationNumber: true, fullName: true },
          },
        },
      }),
      this.prisma.generatedAgreement.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async createAgreement(userId: string, dto: CreateGeneratedAgreementDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: dto.applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    const agreement = await this.prisma.generatedAgreement.create({
      data: {
        applicationId: dto.applicationId,
        agreementType: dto.agreementType,
        status: 'DRAFT',
        generatedByUserId: userId,
        templateSnapshot: {
          borrower: application.fullName,
          loanAmount: application.creditLimit?.toString() ?? null,
          interestRate: application.interestRate?.toString() ?? null,
          tenure: application.period,
          periodUnit: application.periodUnit,
          guarantor: null,
        },
      },
    });

    await this.audit.log(
      userId,
      AuditAction.AGREEMENT_GENERATED,
      { agreementId: agreement.id, agreementType: dto.agreementType },
      dto.applicationId,
      AuditCategory.SYSTEM,
    );

    return agreement;
  }

  private async getAgreementOrThrow(id: string) {
    const agreement = await this.prisma.generatedAgreement.findUnique({
      where: { id },
    });
    if (!agreement)
      throw new NotFoundException('Generated agreement not found');
    return agreement;
  }

  async sendToSign(userId: string, id: string) {
    const agreement = await this.getAgreementOrThrow(id);
    if (agreement.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft agreements can be sent to sign',
      );
    }

    return this.prisma.generatedAgreement.update({
      where: { id },
      data: { status: 'PENDING_SIGNATURE', sentToSignAt: new Date() },
    });
  }

  async markSigned(userId: string, id: string) {
    const agreement = await this.getAgreementOrThrow(id);
    if (agreement.status !== 'PENDING_SIGNATURE') {
      throw new BadRequestException(
        'Only agreements pending signature can be marked signed',
      );
    }

    const updated = await this.prisma.generatedAgreement.update({
      where: { id },
      data: { status: 'SIGNED', signedAt: new Date() },
    });

    await this.audit.log(
      userId,
      AuditAction.AGREEMENT_SIGNED,
      { agreementId: id },
      agreement.applicationId,
      AuditCategory.SYSTEM,
    );

    return updated;
  }
}
