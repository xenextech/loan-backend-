// Re-export Prisma-generated UserRole so it matches at runtime
export { UserRole } from '@prisma/client';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export enum StudyType {
  PROGRAM = 'PROGRAM',
  COURSE = 'COURSE',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATION = 'CERTIFICATION',
}

export enum IdentityType {
  CITIZENSHIP = 'CITIZENSHIP',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
  PAN_NUMBER = 'PAN_NUMBER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum Occupation {
  STUDENT = 'STUDENT',
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
}

export enum FeeStructureMethod {
  DOCUMENT = 'DOCUMENT',
  LINK = 'LINK',
  MANUAL = 'MANUAL',
}

export enum FamilyStructure {
  NUCLEAR = 'NUCLEAR',
  JOINT = 'JOINT',
  EXTENDED = 'EXTENDED',
  SINGLE_PARENT = 'SINGLE_PARENT',
  OTHER = 'OTHER',
}

export enum PeriodUnit {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

export { DocumentType } from '@prisma/client';

// Re-export Prisma-generated AuditAction so new values (dashboard module) stay in sync
export { AuditAction } from '@prisma/client';

export enum ApplicationLinkType {
  PARENT = 'PARENT',
  COLLEGE = 'COLLEGE',
  STUDENT_CONSENT = 'STUDENT_CONSENT',
}

// Re-export Prisma-generated NotificationType so it matches at runtime
export { NotificationType } from '@prisma/client';

export {
  AuditCategory,
  NotificationChannel,
  NotificationDeliveryStatus,
  DisbursementConditionStatus,
  DisbursementStatus,
  TrancheStatus,
  EmiStatus,
  GeneratedAgreementType,
  GeneratedAgreementStatus,
  CommissionPartnerType,
  CommissionRateType,
  CommissionEntryStatus,
  ApplicationStage,
  ApplicationSource,
  LoanAccountStatus,
  NrbLoanClassification,
  ParentDocumentType,
  BlacklistStatus,
  ApprovalEntryStatus,
  FacilityStatus,
} from '@prisma/client';

// NRB digital lending cap per borrower (NPR), used by the commission
// NRB-cap-compliance check. Hardcoded pending real regulatory config.
export const NRB_DIGITAL_LENDING_CAP = 1_000_000;
