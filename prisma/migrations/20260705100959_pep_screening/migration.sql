-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PEP_SCREENING_RECORDED';

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "pepCheckedAt" TIMESTAMP(3),
ADD COLUMN     "pepCheckedByUserId" TEXT,
ADD COLUMN     "pepRemarks" TEXT,
ADD COLUMN     "pepStatus" BOOLEAN;
