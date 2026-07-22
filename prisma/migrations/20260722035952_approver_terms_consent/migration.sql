-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'APPROVER_TERMS_ACCEPTED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "approverTermsAcceptedAt" TIMESTAMP(3);
