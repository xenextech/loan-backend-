-- CreateEnum
CREATE TYPE "LoanAccountStatus" AS ENUM ('ACTIVE', 'CLEARED');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'LOAN_ACCOUNT_CREATED';

-- CreateTable
CREATE TABLE "loan_accounts" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "loanAccountNumber" TEXT NOT NULL,
    "status" "LoanAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loan_accounts_applicationId_key" ON "loan_accounts"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_accounts_loanAccountNumber_key" ON "loan_accounts"("loanAccountNumber");

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
