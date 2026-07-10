import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/enums';
import { serializeDecimals } from '../../common/utils/serialize-decimals.util';
import {
  VaultDocumentDto,
  VaultDocumentListResponseDto,
  VaultDocumentType,
} from './dto/vault-document.dto';

// documentType <-> URL slug used consistently in the vault list response
// (downloadUrl/previewUrl) and the :documentType route param — this is the
// single place to extend when a new document type is added later.
const DOCUMENT_TYPE_LABELS: Record<VaultDocumentType, string> = {
  OFFER_LETTER: 'Offer Letter',
  AGREEMENT: 'Bonafide Agreement',
  ENROLLMENT_CERTIFICATE: 'Enrollment Certificate',
};

const SLUG_TO_TYPE: Record<string, VaultDocumentType> = {
  'offer-letter': 'OFFER_LETTER',
  agreement: 'AGREEMENT',
  'enrollment-certificate': 'ENROLLMENT_CERTIFICATE',
};

interface SourceRow {
  id: string;
  applicationId: string | null;
  collegeName: string;
  refNo: string;
  createdAt: Date;
}

interface ApplicationRef {
  id: string;
  applicationNumber: string | null;
  userId: string | null;
}

@Injectable()
export class DocumentVaultService {
  constructor(private readonly prisma: PrismaService) {}

  async getVaultDocuments(
    userId: string,
    role: UserRole,
    applicationIdFilter?: string,
  ): Promise<VaultDocumentListResponseDto> {
    const applications = await this.resolveApplications(
      userId,
      role,
      applicationIdFilter,
    );
    if (applications.length === 0) return { documents: [] };

    const applicationNumberById = new Map(
      applications.map((a) => [a.id, a.applicationNumber]),
    );
    const applicationIds = applications.map((a) => a.id);
    const where = { applicationId: { in: applicationIds } };
    const select = {
      id: true,
      applicationId: true,
      collegeName: true,
      refNo: true,
      createdAt: true,
    };

    const [offerLetters, agreements, enrollmentCertificates] =
      await Promise.all([
        this.prisma.offerLetter.findMany({ where, select }),
        this.prisma.agreement.findMany({ where, select }),
        this.prisma.enrollmentCertificate.findMany({ where, select }),
      ]);

    const documents = [
      ...offerLetters.map((row) =>
        this.toVaultDocument('OFFER_LETTER', row, applicationNumberById),
      ),
      ...agreements.map((row) =>
        this.toVaultDocument('AGREEMENT', row, applicationNumberById),
      ),
      ...enrollmentCertificates.map((row) =>
        this.toVaultDocument(
          'ENROLLMENT_CERTIFICATE',
          row,
          applicationNumberById,
        ),
      ),
    ].sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());

    return { documents };
  }

  async getVaultDocument(
    typeSlug: string,
    id: string,
    userId: string,
    role: UserRole,
  ) {
    const documentType = SLUG_TO_TYPE[typeSlug];
    if (!documentType) throw new NotFoundException('Unknown document type');

    const record = await this.findSourceRecord(documentType, id);
    if (!record || !record.applicationId) {
      throw new NotFoundException('Document not found');
    }

    if (role === UserRole.STUDENT) {
      const application = await this.prisma.loanApplication.findUnique({
        where: { id: record.applicationId },
        select: { userId: true },
      });
      if (!application || application.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    }
    // Staff roles reuse the existing broad dashboard-staff access pattern —
    // guarded at the controller level, no extra check needed here.

    return { documentType, ...serializeDecimals(record) };
  }

  private async findSourceRecord(documentType: VaultDocumentType, id: string) {
    switch (documentType) {
      case 'OFFER_LETTER':
        return this.prisma.offerLetter.findUnique({ where: { id } });
      case 'AGREEMENT':
        return this.prisma.agreement.findUnique({ where: { id } });
      case 'ENROLLMENT_CERTIFICATE':
        return this.prisma.enrollmentCertificate.findUnique({
          where: { id },
        });
    }
  }

  private async resolveApplications(
    userId: string,
    role: UserRole,
    applicationIdFilter?: string,
  ): Promise<ApplicationRef[]> {
    if (role === UserRole.STUDENT) {
      const applications = await this.prisma.loanApplication.findMany({
        where: { userId },
        select: { id: true, applicationNumber: true, userId: true },
      });
      if (!applicationIdFilter) return applications;
      const match = applications.filter((a) => a.id === applicationIdFilter);
      if (match.length === 0) {
        throw new ForbiddenException(
          'You do not have access to this application',
        );
      }
      return match;
    }

    // Bank staff: must scope to one specific application (no broad browse).
    if (!applicationIdFilter) {
      throw new BadRequestException(
        'applicationId query parameter is required for staff access',
      );
    }
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationIdFilter },
      select: { id: true, applicationNumber: true, userId: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return [application];
  }

  private toVaultDocument(
    documentType: VaultDocumentType,
    row: SourceRow,
    applicationNumberById: Map<string, string | null>,
  ): VaultDocumentDto {
    const slug = Object.entries(SLUG_TO_TYPE).find(
      ([, type]) => type === documentType,
    )?.[0] as string;
    const viewerPath = `/dashboard/document-vault/${slug}/${row.id}`;

    return {
      id: row.id,
      documentType,
      documentName: `${DOCUMENT_TYPE_LABELS[documentType]} — ${row.refNo}`,
      applicationId: row.applicationId as string,
      applicationNumber:
        applicationNumberById.get(row.applicationId as string) ?? null,
      uploadedBy: row.collegeName,
      generatedAt: row.createdAt,
      fileType: 'PDF',
      downloadUrl: viewerPath,
      previewUrl: viewerPath,
      status: 'AVAILABLE',
    };
  }
}
