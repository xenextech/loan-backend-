-- CreateEnum
CREATE TYPE "FamilyStructure" AS ENUM ('NUCLEAR', 'JOINT', 'EXTENDED', 'SINGLE_PARENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PeriodUnit" AS ENUM ('YEAR', 'MONTH');

-- AlterTable
ALTER TABLE "credit_scores" ADD COLUMN     "loanToValueRatio" DECIMAL(5,2),
ADD COLUMN     "performanceYears" INTEGER;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "accountStrategy" TEXT,
ADD COLUMN     "approverDate" TIMESTAMP(3),
ADD COLUMN     "approverName" TEXT,
ADD COLUMN     "approverPost" TEXT,
ADD COLUMN     "approverSignature" TEXT,
ADD COLUMN     "bankingRelationship" TEXT,
ADD COLUMN     "baselClassification" TEXT,
ADD COLUMN     "baselRiskWeight" INTEGER,
ADD COLUMN     "citizenshipIssuedDate" TIMESTAMP(3),
ADD COLUMN     "citizenshipIssuedPlace" TEXT,
ADD COLUMN     "citizenshipNumber" TEXT,
ADD COLUMN     "conclusionAndRecommendation" TEXT,
ADD COLUMN     "correspondenceAddress" TEXT,
ADD COLUMN     "customerGroup" TEXT,
ADD COLUMN     "disbursementSection" TEXT,
ADD COLUMN     "existingBankingRelationship" TEXT,
ADD COLUMN     "facility" TEXT,
ADD COLUMN     "familyStructureType" "FamilyStructure",
ADD COLUMN     "fee" DECIMAL(18,2),
ADD COLUMN     "greenFinanceEconomicSector" TEXT,
ADD COLUMN     "greenFinanceSubSector" TEXT,
ADD COLUMN     "greenFinanceTaxonomyTag" TEXT,
ADD COLUMN     "initiatorDate" TIMESTAMP(3),
ADD COLUMN     "initiatorName" TEXT,
ADD COLUMN     "initiatorPost" TEXT,
ADD COLUMN     "initiatorSignature" TEXT,
ADD COLUMN     "interestRate" DECIMAL(5,2),
ADD COLUMN     "isBlacklisted" BOOLEAN,
ADD COLUMN     "justificationOfLoan" TEXT,
ADD COLUMN     "keyCreditRiskMitigation" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "limit" DECIMAL(18,2),
ADD COLUMN     "moneyLaunderingRisk" TEXT DEFAULT 'The KYC procedure for the client has been complete as a comprehensive screening confirmed that the individual is not listed under any blacklists, Politically Exposed Persons (PEPs), domestic or foreign PEP registries, NRB Rokka restrictions, or multiple account databases.The proposed agriculture loan amount will be utilized for the agriculture expenses as mentioned in the plan sheet. Thus, there will not be any money laundering and terrorist financing risk.',
ADD COLUMN     "nidNumber" TEXT,
ADD COLUMN     "nrb93KaProductCode" TEXT,
ADD COLUMN     "nrb93SectorCode" TEXT,
ADD COLUMN     "nrb94SecurityTypeCode" TEXT,
ADD COLUMN     "obligorNumber" INTEGER,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "period" INTEGER,
ADD COLUMN     "periodUnit" "PeriodUnit",
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "relationshipStartDate" TIMESTAMP(3),
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "repaymentSource" TEXT,
ADD COLUMN     "sis0IndustrialClassification" TEXT,
ADD COLUMN     "sis1ProductType" TEXT,
ADD COLUMN     "sis2Sector" TEXT,
ADD COLUMN     "sis3Security" TEXT,
ADD COLUMN     "sis4InstitutionalGroupingOfBorrower" TEXT,
ADD COLUMN     "sis9PriorityLending" TEXT,
ADD COLUMN     "supporterDate" TIMESTAMP(3),
ADD COLUMN     "supporterName" TEXT,
ADD COLUMN     "supporterPost" TEXT,
ADD COLUMN     "supporterSignature" TEXT,
ADD COLUMN     "termsAndConditions" TEXT,
ADD COLUMN     "utilizationOfFund" TEXT,
ADD COLUMN     "waiver" TEXT;

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "qualification" TEXT NOT NULL,
    "relationshipWithBorrower" TEXT NOT NULL,
    "occupationSocialInvolvement" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Security" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "securityDetails" TEXT NOT NULL,
    "fmv" DECIMAL(18,2) NOT NULL,
    "proposedLoan" DECIMAL(18,2) NOT NULL,
    "financeAgainstFmvRatio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalGuarantee" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "nameOfGuarantor" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "netWorth" DECIMAL(18,2) NOT NULL,
    "guarantorConsent" BOOLEAN NOT NULL,
    "ciclStatus" BOOLEAN NOT NULL,
    "ciclRemarks" TEXT,
    "blackListedDate" TIMESTAMP(3),
    "releasedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalGuarantee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "insuredAssets" TEXT NOT NULL,
    "valueOfAssets" DECIMAL(18,2) NOT NULL,
    "sumOfInsurance" DECIMAL(18,2) NOT NULL,
    "insuranceCoverage" DECIMAL(5,2) NOT NULL,
    "insuranceRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepaymentCapacity" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "insuredAssets" INTEGER NOT NULL,
    "valueOfAssets" DECIMAL(18,2) NOT NULL,
    "sumOfInsurance" DECIMAL(18,2) NOT NULL,
    "insuranceCoverage" DECIMAL(5,2) NOT NULL,
    "insuranceRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepaymentCapacity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Security" ADD CONSTRAINT "Security_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalGuarantee" ADD CONSTRAINT "PersonalGuarantee_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepaymentCapacity" ADD CONSTRAINT "RepaymentCapacity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
