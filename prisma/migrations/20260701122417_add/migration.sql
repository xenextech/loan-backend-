-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN', 'PARENT', 'COLLEGE', 'INITIATOR', 'SUPPORTER', 'APPROVER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('PROGRAM', 'COURSE', 'DIPLOMA', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('CITIZENSHIP', 'PASSPORT', 'DRIVING_LICENSE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('STUDENT', 'EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED');

-- CreateEnum
CREATE TYPE "FeeStructureMethod" AS ENUM ('DOCUMENT', 'LINK', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY_FRONT', 'IDENTITY_BACK', 'APPLICANT_PHOTO', 'ACADEMIC_RECORD', 'FEE_STRUCTURE', 'STUDENT_APPLICATION', 'OFFER_LETTER', 'ENROLLMENT_DOCUMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DATABASE', 'EMAIL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_SUBMITTED', 'APPLICATION_LINK_GENERATED', 'COLLEGE_FORM_SUBMITTED', 'PARENT_FORM_SUBMITTED');

-- CreateEnum
CREATE TYPE "ApplicationLinkType" AS ENUM ('PARENT', 'COLLEGE');

-- CreateEnum
CREATE TYPE "creditLimit" AS ENUM ('below1M', 'from1MTo2Point5M', 'above2Point5M');

-- CreateEnum
CREATE TYPE "Dsgir" AS ENUM ('below40', 'from40To45', 'above45');

-- CreateEnum
CREATE TYPE "OperationOfInstitution" AS ENUM ('above10Years', 'from5To10Years', 'below5Years');

-- CreateEnum
CREATE TYPE "SatisfactoryPerformance" AS ENUM ('above3Years', 'from1To3Years', 'below1Year');

-- CreateEnum
CREATE TYPE "ParentsBorrowingsWithBFIs" AS ENUM ('borrowingFromUs', 'borrowingFromOtherBFI', 'borrowingFromOtherBFIS');

-- CreateEnum
CREATE TYPE "SourceOfIncome" AS ENUM ('fixedIncome', 'salaryRentBusiness', 'mixedIncome');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "identityType" "IdentityType",
    "identityNumber" TEXT,
    "identityName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "occupation" "Occupation",
    "issuedDistrict" TEXT,
    "issuedDate" TIMESTAMP(3),
    "province" TEXT,
    "district" TEXT,
    "municipality" TEXT,
    "ward" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "grandfatherName" TEXT,
    "maritalStatus" "MaritalStatus",
    "spouseName" TEXT,
    "informationAccurate" BOOLEAN,
    "authorizeVerification" BOOLEAN,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_scores" (
    "id" TEXT NOT NULL,
    "loanApplicationId" TEXT NOT NULL,
    "creditLimit" "creditLimit" NOT NULL,
    "dsgir" "Dsgir" NOT NULL,
    "operationOfInstitution" "OperationOfInstitution" NOT NULL,
    "satisfactoryPerformance" "SatisfactoryPerformance" NOT NULL,
    "parentsBorrowingsWithBFIs" "ParentsBorrowingsWithBFIs" NOT NULL,
    "sourceOfIncome" "SourceOfIncome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_information" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studyType" "StudyType",
    "courseName" TEXT,
    "boardUniversity" TEXT,
    "courseDuration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_information" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "loanAmount" DECIMAL(12,2),
    "expectedSalary" DECIMAL(12,2),
    "feeStructureMethod" "FeeStructureMethod",
    "feeStructureUrl" TEXT,
    "feeStructureText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "bucketName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "contact" TEXT,
    "citizenshipNumber" TEXT,
    "salaryBankName" TEXT,
    "bankAccountNumber" TEXT,
    "salarySheetFileName" TEXT,
    "salarySheetOriginalFileName" TEXT,
    "salarySheetMimeType" TEXT,
    "salarySheetSize" INTEGER,
    "salarySheetBucketName" TEXT,
    "salarySheetFilePath" TEXT,
    "salarySheetPublicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "action" "AuditAction" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "linkType" "ApplicationLinkType" NOT NULL,
    "recipientEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_verifications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "collegeName" TEXT,
    "collegeEmail" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "isApplicationVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationNotes" TEXT,
    "offerLetterFileName" TEXT,
    "offerLetterOriginalFileName" TEXT,
    "offerLetterMimeType" TEXT,
    "offerLetterSize" INTEGER,
    "offerLetterBucketName" TEXT,
    "offerLetterFilePath" TEXT,
    "offerLetterPublicUrl" TEXT,
    "enrollmentDocFileName" TEXT,
    "enrollmentDocOriginalFileName" TEXT,
    "enrollmentDocMimeType" TEXT,
    "enrollmentDocSize" INTEGER,
    "enrollmentDocBucketName" TEXT,
    "enrollmentDocFilePath" TEXT,
    "enrollmentDocPublicUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_verifications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "contact" TEXT,
    "citizenshipNumber" TEXT,
    "salaryBankName" TEXT,
    "bankAccountNumber" TEXT,
    "salarySheetFileName" TEXT,
    "salarySheetOriginalFileName" TEXT,
    "salarySheetMimeType" TEXT,
    "salarySheetSize" INTEGER,
    "salarySheetBucketName" TEXT,
    "salarySheetFilePath" TEXT,
    "salarySheetPublicUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_letters" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "validUntilAD" TEXT,
    "validUntilBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "studentDobAD" TEXT,
    "studentDobBS" TEXT,
    "citizenshipNumber" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "permanentAddress" TEXT,
    "district" TEXT,
    "province" TEXT,
    "programName" TEXT,
    "programFullName" TEXT,
    "programAffiliation" TEXT,
    "durationYears" INTEGER,
    "totalSemesters" INTEGER,
    "creditHours" INTEGER,
    "academicYearBS" TEXT,
    "intakeMonthBS" TEXT,
    "admissionFee" DECIMAL(14,2),
    "tuitionPerSem" DECIMAL(14,2),
    "examFeePerSem" DECIMAL(14,2),
    "labFeePerSem" DECIMAL(14,2),
    "totalApprox" DECIMAL(14,2),
    "conditions" JSONB,
    "signatories" JSONB,
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "tuRollNo" TEXT,
    "enrollmentNo" TEXT,
    "programName" TEXT,
    "currentYear" TEXT,
    "currentSemester" TEXT,
    "academicYearBS" TEXT,
    "studentStatus" TEXT,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT true,
    "hasBacklogs" BOOLEAN NOT NULL DEFAULT false,
    "disciplinaryHold" BOOLEAN NOT NULL DEFAULT false,
    "feeDueRs" DECIMAL(14,2),
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_certificates" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeCode" TEXT,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "tuRollNo" TEXT,
    "enrollmentNo" TEXT,
    "programName" TEXT,
    "currentYear" TEXT,
    "currentSemester" TEXT,
    "academicYearBS" TEXT,
    "studentStatus" TEXT,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT true,
    "hasBacklogs" BOOLEAN NOT NULL DEFAULT false,
    "disciplinaryHold" BOOLEAN NOT NULL DEFAULT false,
    "feeDueRs" DECIMAL(14,2),
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_applicationNumber_key" ON "loan_applications"("applicationNumber");

-- CreateIndex
CREATE INDEX "loan_applications_userId_idx" ON "loan_applications"("userId");

-- CreateIndex
CREATE INDEX "loan_applications_status_idx" ON "loan_applications"("status");

-- CreateIndex
CREATE INDEX "loan_applications_submittedAt_idx" ON "loan_applications"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_scores_loanApplicationId_key" ON "credit_scores"("loanApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "study_information_applicationId_key" ON "study_information"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_information_applicationId_key" ON "loan_information"("applicationId");

-- CreateIndex
CREATE INDEX "documents_applicationId_idx" ON "documents"("applicationId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_profiles_userId_key" ON "parent_profiles"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_applicationId_idx" ON "audit_logs"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "application_links_token_key" ON "application_links"("token");

-- CreateIndex
CREATE INDEX "application_links_token_idx" ON "application_links"("token");

-- CreateIndex
CREATE INDEX "application_links_recipientEmail_idx" ON "application_links"("recipientEmail");

-- CreateIndex
CREATE INDEX "application_links_applicationId_idx" ON "application_links"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "college_verifications_applicationId_key" ON "college_verifications"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_verifications_applicationId_key" ON "parent_verifications"("applicationId");

-- CreateIndex
CREATE INDEX "offer_letters_createdByEmail_idx" ON "offer_letters"("createdByEmail");

-- CreateIndex
CREATE INDEX "agreements_createdByEmail_idx" ON "agreements"("createdByEmail");

-- CreateIndex
CREATE INDEX "enrollment_certificates_createdByEmail_idx" ON "enrollment_certificates"("createdByEmail");

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_information" ADD CONSTRAINT "study_information_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_information" ADD CONSTRAINT "loan_information_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_links" ADD CONSTRAINT "application_links_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_verifications" ADD CONSTRAINT "college_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_verifications" ADD CONSTRAINT "parent_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
