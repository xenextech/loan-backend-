-- CreateEnum
CREATE TYPE "CollectionActivityType" AS ENUM ('CALL', 'SMS', 'EMAIL', 'WHATSAPP', 'VISIT', 'NOTE', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'LOAN_SERVICING_CONFIGURED';
ALTER TYPE "AuditAction" ADD VALUE 'LOAN_SERVICING_NOTIFIED';
ALTER TYPE "AuditAction" ADD VALUE 'COLLECTION_ACTIVITY_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'LOAN_NEEDS_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE 'LOAN_REVIEW_RESOLVED';

-- AlterEnum
ALTER TYPE "LoanAccountStatus" ADD VALUE 'NEEDS_REVIEW';

-- AlterTable
ALTER TABLE "loan_accounts" ADD COLUMN     "borrowerNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "clearedAt" TIMESTAMP(3),
ADD COLUMN     "configuredAt" TIMESTAMP(3),
ADD COLUMN     "configuredByUserId" TEXT,
ADD COLUMN     "emiStartDate" TIMESTAMP(3),
ADD COLUMN     "finalInterestRate" DECIMAL(5,2),
ADD COLUMN     "finalTenureMonths" INTEGER,
ADD COLUMN     "firstDueDate" TIMESTAMP(3),
ADD COLUMN     "gracePeriodMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewReason" TEXT,
ADD COLUMN     "reviewRequestedAt" TIMESTAMP(3),
ADD COLUMN     "reviewRequestedByUserId" TEXT,
ADD COLUMN     "reviewResolvedAt" TIMESTAMP(3),
ADD COLUMN     "reviewResolvedByUserId" TEXT;

-- CreateTable
CREATE TABLE "collection_activities" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "activityType" "CollectionActivityType" NOT NULL,
    "notes" TEXT NOT NULL,
    "contactedPerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_activities_applicationId_idx" ON "collection_activities"("applicationId");

-- AddForeignKey
ALTER TABLE "collection_activities" ADD CONSTRAINT "collection_activities_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
