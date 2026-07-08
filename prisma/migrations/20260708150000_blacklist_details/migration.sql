-- CreateEnum
CREATE TYPE "BlacklistStatus" AS ENUM ('BLACKLISTED', 'NOT_BLACKLISTED');

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN "blacklistStatus" "BlacklistStatus",
ADD COLUMN "blacklistReason" TEXT,
ADD COLUMN "blacklistDate" TIMESTAMP(3),
ADD COLUMN "blacklistReferenceNumber" TEXT;
