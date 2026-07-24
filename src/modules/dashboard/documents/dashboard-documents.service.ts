import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  AuditAction,
  AuditCategory,
  GeneratedAgreementType,
} from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { resolveEffectiveLoanTerms } from '../../../common/utils/loan-principal.util';
import { generateLegalDocumentNumber } from '../../../common/utils/legal-document-number.util';
import { VerifyOfferLetterDto } from '../dto/offer-letter-verify.dto';
import { DocumentVaultQueryDto } from '../dto/document-vault-query.dto';
import {
  CreateGeneratedAgreementDto,
  GeneratedAgreementQueryDto,
} from '../dto/generated-agreement.dto';

const AGREEMENT_TYPE_LABEL: Record<GeneratedAgreementType, string> = {
  [GeneratedAgreementType.LOAN_AGREEMENT]: 'Loan Agreement',
  [GeneratedAgreementType.GUARANTEE_DEED]: 'Guarantee Deed',
  [GeneratedAgreementType.HYPOTHECATION]: 'Hypothecation Deed',
  [GeneratedAgreementType.PROMISSORY_NOTE]: 'Promissory Note',
};

@Injectable()
export class DashboardDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
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

  // Auto-populates every field already known to the system (student, college,
  // loan product, finalized disbursement/interest/EMI/tenure, guarantor) from
  // the application + its Credit-Manager-configured LoanAccount + its
  // generated EmiScheduleEntry rows — the same "effective loan terms"
  // precedence used for repayment scheduling (resolveEffectiveLoanTerms),
  // so a document generated before or after final servicing configuration
  // is always consistent with whatever the Credit Manager has locked in so
  // far. The user-supplied inputs are `remarks` (additional
  // clauses/conditions) and `institutionName` (the partner bank/NBFC this
  // document is issued on behalf of, defaulting to "Unnati") — nothing
  // already stored in the DB is re-entered.
  async createAgreement(userId: string, dto: CreateGeneratedAgreementDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: dto.applicationId },
      include: {
        studyInformation: true,
        loanInformation: true,
        collegeVerification: true,
        personalGuarantee: true,
        disbursement: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');

    const [loanAccount, scheduleEntries, actor] = await Promise.all([
      this.prisma.loanAccount.findUnique({
        where: { applicationId: dto.applicationId },
      }),
      this.prisma.emiScheduleEntry.findMany({
        where: { applicationId: dto.applicationId },
        orderBy: { installmentNumber: 'asc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, email: true },
      }),
    ]);

    const terms = resolveEffectiveLoanTerms({
      finalPrincipalAmount: loanAccount?.finalPrincipalAmount,
      totalDisbursedAmount: application.disbursement?.totalDisbursedAmount,
      creditLimit: application.creditLimit,
      loanAmount: application.loanInformation?.loanAmount,
      finalInterestRate: loanAccount?.finalInterestRate,
      interestRate: application.interestRate,
      finalTenureMonths: loanAccount?.finalTenureMonths,
      period: application.period,
      periodUnit: application.periodUnit,
      gracePeriodMonths: loanAccount?.gracePeriodMonths,
      repaymentFrequency: loanAccount?.repaymentFrequency,
      interestFrequency: loanAccount?.interestFrequency,
    });

    const emiAmount = scheduleEntries[0]
      ? Number(scheduleEntries[0].emiAmount)
      : null;
    const totalRepayment = scheduleEntries.length
      ? scheduleEntries.reduce((sum, e) => sum + Number(e.emiAmount), 0)
      : null;

    const generatedByName = actor?.fullName ?? actor?.email ?? 'Unknown';
    const documentNumber = generateLegalDocumentNumber();

    // Citizenship no./issue office, addresses, and the branch manager's name
    // aren't captured anywhere in the application data — they're blanks on
    // the paper Loan Agreement that the Credit Manager fills in by hand.
    // `guarantorName`/`guarantorRelationship` also let the Credit Manager
    // override or supply the guarantor when personalGuarantee wasn't
    // collected on the application.
    const guarantorName =
      dto.guarantorName?.trim() ||
      application.personalGuarantee?.nameOfGuarantor ||
      null;
    const guarantorRelationship =
      dto.guarantorRelationship?.trim() ||
      application.personalGuarantee?.relationship ||
      null;
    const guarantor =
      guarantorName || application.personalGuarantee
        ? {
            name: guarantorName,
            relationship: guarantorRelationship,
            netWorth:
              application.personalGuarantee?.netWorth?.toString() ?? null,
            citizenshipNo: dto.guarantorCitizenshipNo?.trim() || null,
            citizenshipIssueDate:
              dto.guarantorCitizenshipIssueDate?.trim() || null,
            citizenshipOffice: dto.guarantorCitizenshipOffice?.trim() || null,
            address: dto.guarantorAddress?.trim() || null,
            fatherOrHusbandName: dto.guarantorFatherOrHusbandName?.trim() || null,
            grandfatherName: dto.guarantorGrandfatherName?.trim() || null,
            permanentDistrict: dto.guarantorPermanentDistrict?.trim() || null,
            permanentMunicipality: dto.guarantorPermanentMunicipality?.trim() || null,
            permanentWardNo: dto.guarantorPermanentWardNo?.trim() || null,
            age: dto.guarantorAge?.trim() || null,
          }
        : null;

    const agreement = await this.prisma.generatedAgreement.create({
      data: {
        applicationId: dto.applicationId,
        agreementType: dto.agreementType,
        status: 'DRAFT',
        generatedByUserId: userId,
        generatedByName,
        documentNumber,
        templateSnapshot: {
          studentName: application.fullName,
          applicationNumber: application.applicationNumber,
          collegeName:
            application.collegeVerification?.collegeName ??
            application.collegeName ??
            null,
          courseName: application.studyInformation?.courseName ?? null,
          loanProduct: application.facility ?? 'Education Loan',
          finalDisbursementAmount: terms.principal,
          interestRate: terms.interestRate,
          tenureMonths: terms.tenureMonths,
          gracePeriodMonths: terms.gracePeriodMonths,
          repaymentFrequency: terms.repaymentFrequency,
          emiAmount,
          totalRepayment,
          guarantor,
          remarks: dto.remarks ?? null,
          generatedByName,
          generatedAt: new Date().toISOString(),
          institutionName: dto.institutionName?.trim() || 'Unnati',
          studentAddress: dto.studentAddress?.trim() || null,
          studentCitizenshipNo: dto.studentCitizenshipNo?.trim() || null,
          studentCitizenshipOffice:
            dto.studentCitizenshipOffice?.trim() || null,
          studentCitizenshipIssueDate:
            dto.studentCitizenshipIssueDate?.trim() || null,
          studentFatherOrHusbandName:
            dto.studentFatherOrHusbandName?.trim() || null,
          studentGrandfatherName: dto.studentGrandfatherName?.trim() || null,
          studentPermanentDistrict:
            dto.studentPermanentDistrict?.trim() || null,
          studentPermanentMunicipality:
            dto.studentPermanentMunicipality?.trim() || null,
          studentPermanentWardNo:
            dto.studentPermanentWardNo?.trim() || null,
          branchManagerName: dto.branchManagerName?.trim() || null,
          collateralOwnerName: dto.collateralOwnerName?.trim() || null,
          collateralAddress: dto.collateralAddress?.trim() || null,
          collateralPlotNo: dto.collateralPlotNo?.trim() || null,
          collateralArea: dto.collateralArea?.trim() || null,
          collateralRemarks: dto.collateralRemarks?.trim() || null,
          approvalLetterDate: dto.approvalLetterDate?.trim() || null,
          loanExpiryDate: dto.loanExpiryDate?.trim() || null,
          borrowerPosition: dto.borrowerPosition?.trim() || null,
          bankAccountName: dto.bankAccountName?.trim() || null,
          bankAccountNumber: dto.bankAccountNumber?.trim() || null,
        },
      },
    });

    await this.audit.log(
      userId,
      AuditAction.AGREEMENT_GENERATED,
      {
        agreementId: agreement.id,
        agreementType: dto.agreementType,
        documentNumber,
      },
      dto.applicationId,
      AuditCategory.SYSTEM,
    );

    await this.notifications.notifyLegalDocumentGenerated({
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        userId: application.userId,
        initiatorUserId: application.initiatorUserId,
        supporterUserId: application.supporterUserId,
        checkerUserId: application.checkerUserId,
        approverUserId: application.approverUserId,
      },
      documentLabel: AGREEMENT_TYPE_LABEL[dto.agreementType],
      documentNumber,
      generatedByName,
    });

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

    const updated = await this.prisma.generatedAgreement.update({
      where: { id },
      data: { status: 'PENDING_SIGNATURE', sentToSignAt: new Date() },
    });

    const application = await this.prisma.loanApplication.findUnique({
      where: { id: agreement.applicationId },
      select: {
        id: true,
        applicationNumber: true,
        fullName: true,
        phoneNumber: true,
        userId: true,
      },
    });
    if (application) {
      await this.notifications.notifyStudentDocumentReadyToSign({
        userId: application.userId,
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        fullName: application.fullName,
        phoneNumber: application.phoneNumber,
        documentLabel: AGREEMENT_TYPE_LABEL[agreement.agreementType],
        documentNumber: agreement.documentNumber,
      });
    }

    return updated;
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
