-- CreateEnum
CREATE TYPE "NrbLoanClassification" AS ENUM ('PASS', 'SUBSTANDARD', 'DOUBTFUL', 'LOSS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'PENAL_INTEREST_ACCRUED';
ALTER TYPE "AuditAction" ADD VALUE 'LOAN_RECLASSIFIED';

-- AlterTable
ALTER TABLE "emi_schedule_entries" ADD COLUMN     "penalInterestAccrued" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "nrbClassification" "NrbLoanClassification" NOT NULL DEFAULT 'PASS',
ADD COLUMN     "nrbClassifiedAt" TIMESTAMP(3);
