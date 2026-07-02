-- CreateEnum
CREATE TYPE "CreditFacilitySize" AS ENUM ('BELOW_1_LAKH', 'ONE_LAKH_TO_2_5_LAKH', 'ABOVE_2_5_LAKH');

-- CreateEnum
CREATE TYPE "DSGIR" AS ENUM ('BELOW_40_PERCENT', 'RANGE_40_TO_45_PERCENT', 'ABOVE_45_PERCENT');

-- CreateEnum
CREATE TYPE "CollegeOperation" AS ENUM ('MORE_THAN_10_YEARS', 'FIVE_TO_10_YEARS', 'LESS_THAN_5_YEARS');

-- CreateEnum
CREATE TYPE "InstitutionPerformance" AS ENUM ('ABOVE_3_YEARS', 'ONE_TO_3_YEARS', 'LESS_THAN_1_YEAR');

-- CreateEnum
CREATE TYPE "ParentBorrowing" AS ENUM ('BORROWING_FROM_US', 'BORROWING_FROM_ONE_OTHER_BFI', 'BORROWING_FROM_MULTIPLE_BFIS');

-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('FIXED_INCOME', 'SALARY', 'RENT', 'BUSINESS_INCOME', 'MIXED_INCOME');

-- CreateTable
CREATE TABLE "initiator_verifications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "creditFacilitySize" "CreditFacilitySize",
    "dsgir" "DSGIR",
    "collegeOperation" "CollegeOperation",
    "institutionPerformance" "InstitutionPerformance",
    "parentsBorrowings" "ParentBorrowing",
    "sourceOfIncome" "IncomeSource",
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiator_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "initiator_verifications_applicationId_key" ON "initiator_verifications"("applicationId");

-- AddForeignKey
ALTER TABLE "initiator_verifications" ADD CONSTRAINT "initiator_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
