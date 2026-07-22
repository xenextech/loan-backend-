-- AlterTable
-- Removes the abandoned Approver self-consent gate column (superseded by the
-- student-facing consent feature below) — never used by any real data.
ALTER TABLE "users" DROP COLUMN "approverTermsAcceptedAt";

-- AlterEnum
ALTER TYPE "ApplicationLinkType" ADD VALUE 'STUDENT_CONSENT';

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'STUDENT_CONSENT_SENT';
ALTER TYPE "AuditAction" ADD VALUE 'STUDENT_CONSENT_ACCEPTED';

-- CreateTable
CREATE TABLE "student_consents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "termsText" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "consentedAt" TIMESTAMP(3),
    "consentedIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_consents_applicationId_key" ON "student_consents"("applicationId");

-- AddForeignKey
ALTER TABLE "student_consents" ADD CONSTRAINT "student_consents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
