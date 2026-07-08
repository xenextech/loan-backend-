-- CreateEnum
CREATE TYPE "RepaymentFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "loan_accounts" ADD COLUMN     "repaymentFrequency" "RepaymentFrequency" NOT NULL DEFAULT 'MONTHLY';
