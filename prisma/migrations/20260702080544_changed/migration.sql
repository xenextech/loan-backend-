/*
  Warnings:

  - You are about to drop the `credit_scores` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "credit_scores" DROP CONSTRAINT "credit_scores_loanApplicationId_fkey";

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "creditFacilitySize" INTEGER,
ADD COLUMN     "dsgir" INTEGER,
ADD COLUMN     "loanToValueRatio" DECIMAL(5,2),
ADD COLUMN     "operationOfInstitution" INTEGER,
ADD COLUMN     "parentsBorrowingsWithBFIs" TEXT,
ADD COLUMN     "performanceYears" INTEGER,
ADD COLUMN     "satisfactoryPerformance" INTEGER,
ADD COLUMN     "sourceOfIncome" TEXT,
ALTER COLUMN "moneyLaunderingRisk" DROP DEFAULT;

-- DropTable
DROP TABLE "credit_scores";
