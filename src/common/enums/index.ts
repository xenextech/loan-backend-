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

export enum DocumentType {
  IDENTITY_FRONT = 'IDENTITY_FRONT',
  IDENTITY_BACK = 'IDENTITY_BACK',
  APPLICANT_PHOTO = 'APPLICANT_PHOTO',
  ACADEMIC_RECORD = 'ACADEMIC_RECORD',
  FEE_STRUCTURE = 'FEE_STRUCTURE',
}

export enum AuditAction {
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_UPDATED = 'APPLICATION_UPDATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
}

export enum NotificationType {
  DATABASE = 'DATABASE',
  EMAIL = 'EMAIL',
}
