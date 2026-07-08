-- AlterTable
ALTER TABLE "loan_accounts" ADD COLUMN     "interestFrequency" "RepaymentFrequency",
ADD COLUMN     "finalPrincipalAmount" DECIMAL(18,2);
