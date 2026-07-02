/*
  Warnings:

  - You are about to drop the column `financeAgainstFmvRatio` on the `Security` table. All the data in the column will be lost.
  - You are about to drop the column `creditLimit` on the `loan_applications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationId]` on the table `FamilyMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId]` on the table `Insurance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId]` on the table `PersonalGuarantee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId]` on the table `RepaymentCapacity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicationId]` on the table `Security` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FamilyMember" ALTER COLUMN "personName" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "qualification" DROP NOT NULL,
ALTER COLUMN "relationshipWithBorrower" DROP NOT NULL,
ALTER COLUMN "occupationSocialInvolvement" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Insurance" ALTER COLUMN "insuredAssets" DROP NOT NULL,
ALTER COLUMN "valueOfAssets" DROP NOT NULL,
ALTER COLUMN "sumOfInsurance" DROP NOT NULL,
ALTER COLUMN "insuranceCoverage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PersonalGuarantee" ALTER COLUMN "nameOfGuarantor" DROP NOT NULL,
ALTER COLUMN "relationship" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "netWorth" DROP NOT NULL,
ALTER COLUMN "guarantorConsent" DROP NOT NULL,
ALTER COLUMN "ciclStatus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RepaymentCapacity" ALTER COLUMN "insuredAssets" DROP NOT NULL,
ALTER COLUMN "valueOfAssets" DROP NOT NULL,
ALTER COLUMN "sumOfInsurance" DROP NOT NULL,
ALTER COLUMN "insuranceCoverage" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Security" DROP COLUMN "financeAgainstFmvRatio",
ADD COLUMN     "financeAgainstFmv" DECIMAL(5,2),
ALTER COLUMN "securityDetails" DROP NOT NULL,
ALTER COLUMN "fmv" DROP NOT NULL,
ALTER COLUMN "proposedLoan" DROP NOT NULL;

-- AlterTable
ALTER TABLE "loan_applications" DROP COLUMN "creditLimit",
ADD COLUMN     "bankingRelationshipScore" INTEGER,
ADD COLUMN     "creditLimit" DECIMAL(18,2),
ADD COLUMN     "creditRiskScoring" TEXT,
ADD COLUMN     "riskGrade" TEXT,
ADD COLUMN     "sourceOfIncomeScore" INTEGER,
ADD COLUMN     "totalPercentage" DECIMAL(5,2),
ADD COLUMN     "totalScore" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_applicationId_key" ON "FamilyMember"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Insurance_applicationId_key" ON "Insurance"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalGuarantee_applicationId_key" ON "PersonalGuarantee"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "RepaymentCapacity_applicationId_key" ON "RepaymentCapacity"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Security_applicationId_key" ON "Security"("applicationId");
