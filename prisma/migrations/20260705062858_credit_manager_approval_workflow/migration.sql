-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('INITIATED', 'SUPPORTED', 'CHECKING', 'APPROVED', 'REJECTED', 'SENT_BACK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_SUPPORTED';
ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_CHECKED';
ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_REJECTED';
ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_SENT_BACK';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CREDIT_MANAGER';

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "checkerDate" TIMESTAMP(3),
ADD COLUMN     "checkerName" TEXT,
ADD COLUMN     "checkerPost" TEXT,
ADD COLUMN     "checkerSignature" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedByUserId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "sentBackAt" TIMESTAMP(3),
ADD COLUMN     "sentBackByUserId" TEXT,
ADD COLUMN     "sentBackReason" TEXT,
ADD COLUMN     "sentBackToStage" "ApplicationStage",
ADD COLUMN     "stage" "ApplicationStage";

-- CreateIndex
CREATE INDEX "loan_applications_stage_idx" ON "loan_applications"("stage");
