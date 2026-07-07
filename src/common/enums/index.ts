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
  LoanAccountStatus,
  NrbLoanClassification,
} from '@prisma/client';
export const CREDIT_FACILITY_SIZE_BELOW1M_WEIGHT = 2;
export const CREDIT_FACILITY_SIZE_BELOW1M_POINT = 1;

export const CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_WEIGHT = 2;
export const CREDIT_FACILITY_SIZE_FROM1M_TO2POINT5M_POINT = 2;

export const CREDIT_FACILITY_SIZE_ABOVE2POINT5M_WEIGHT = 2;
export const CREDIT_FACILITY_SIZE_ABOVE2POINT5M_POINT = 3;

export const DSGIR_BELOW40_WEIGHT = 3;
export const DSGIR_BELOW40_POINT = 1;

export const DSGIR_FROM40_TO45_WEIGHT = 3;
export const DSGIR_FROM40_TO45_POINT = 2;

export const DSGIR_ABOVE45_WEIGHT = 3;
export const DSGIR_ABOVE45_POINT = 1;

export const OPERATION_OF_INSTITUTION_ABOVE10YEARS_WEIGHT = 2;
export const OPERATION_OF_INSTITUTION_ABOVE10YEARS_POINT = 1;

export const OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_WEIGHT = 2;
export const OPERATION_OF_INSTITUTION_FROM5_TO10YEARS_POINT = 2;

export const OPERATION_OF_INSTITUTION_BELOW5YEARS_WEIGHT = 2;
export const OPERATION_OF_INSTITUTION_BELOW5YEARS_POINT = 3;

export const SATISFACTORY_PERFORMANCE_above3Years_WEIGHT = 1;
export const SATISFACTORY_PERFORMANCE_above3Years_POINT = 1;

export const SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_WEIGHT = 1;
export const SATISFACTORY_PERFORMANCE_FROM1_TO3YRS_POINT = 2;

export const SATISFACTORY_PERFORMANCE_below1Year_WEIGHT = 1;
export const SATISFACTORY_PERFORMANCE_below1Year_POINT = 3;

export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_WEIGHT = 1;
export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_US_POINT = 1;

export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_WEIGHT = 1;
export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFI_POINT = 2;

export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_WEIGHT = 1;
export const PARENTS_BORROWINGS_WITH_BFIS_BORROWING_FROM_OTHER_BFIS_POINT = 3;

export const SOURCE_OF_INCOME_FIXED_INCOME_WEIGHT = 1;
export const SOURCE_OF_INCOME_FIXED_INCOME_POINT = 1;

export const SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_WEIGHT = 1;
export const SOURCE_OF_INCOME_SALARY_RENT_BUSINESS_POINT = 2;

export const SOURCE_OF_INCOME_MIXED_INCOME_WEIGHT = 1;
export const SOURCE_OF_INCOME_MIXED_INCOME_POINT = 3;

// NRB digital lending cap per borrower (NPR), used by the commission
// NRB-cap-compliance check. Hardcoded pending real regulatory config.
export const NRB_DIGITAL_LENDING_CAP = 1_000_000;
