-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PARENT_FORM_SUBMITTED';

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

-- CreateIndex
CREATE UNIQUE INDEX "parent_verifications_applicationId_key" ON "parent_verifications"("applicationId");

-- AddForeignKey
ALTER TABLE "parent_verifications" ADD CONSTRAINT "parent_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
