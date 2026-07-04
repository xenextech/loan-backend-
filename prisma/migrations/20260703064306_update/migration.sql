/*
  Warnings:

  - You are about to drop the `Security` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Security" DROP CONSTRAINT "Security_applicationId_fkey";

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "financeAgainstFmv" DECIMAL(5,2),
ADD COLUMN     "fmv" DECIMAL(18,2),
ADD COLUMN     "proposedLoan" DECIMAL(18,2),
ADD COLUMN     "securityDetails" TEXT;

-- DropTable
DROP TABLE "Security";
