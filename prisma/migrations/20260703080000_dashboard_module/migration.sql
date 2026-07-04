-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('APPROVAL', 'DISBURSEMENT', 'REPAYMENT', 'COMMISSION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('APP', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "DisbursementConditionStatus" AS ENUM ('PENDING', 'DONE', 'MISSING');

-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TrancheStatus" AS ENUM ('PENDING', 'CREDITED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmiStatus" AS ENUM ('UPCOMING', 'PAID', 'OVERDUE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "GeneratedAgreementType" AS ENUM ('LOAN_AGREEMENT', 'GUARANTEE_DEED', 'HYPOTHECATION', 'PROMISSORY_NOTE');

-- CreateEnum
CREATE TYPE "GeneratedAgreementStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "CommissionPartnerType" AS ENUM ('BANK', 'COLLEGE');

-- CreateEnum
CREATE TYPE "CommissionRateType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "CommissionEntryStatus" AS ENUM ('PENDING', 'INVOICE_DUE', 'PAID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'DISBURSEMENT_CONDITION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'DISBURSEMENT_CONFIRMED';
ALTER TYPE "AuditAction" ADD VALUE 'DISBURSEMENT_TRANCHE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'EMI_SCHEDULE_GENERATED';
ALTER TYPE "AuditAction" ADD VALUE 'EMI_PAYMENT_RECORDED';
ALTER TYPE "AuditAction" ADD VALUE 'EMI_MARKED_OVERDUE';
ALTER TYPE "AuditAction" ADD VALUE 'COMMISSION_ENTRY_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'COMMISSION_ENTRY_PAID';
ALTER TYPE "AuditAction" ADD VALUE 'COMMISSION_PARTNER_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'AGREEMENT_GENERATED';
ALTER TYPE "AuditAction" ADD VALUE 'AGREEMENT_SIGNED';
ALTER TYPE "AuditAction" ADD VALUE 'INSURANCE_POLICY_ADDED';
ALTER TYPE "AuditAction" ADD VALUE 'NOTIFICATION_TEMPLATE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'OFFER_LETTER_VERIFIED';
ALTER TYPE "AuditAction" ADD VALUE 'MANUAL_AUDIT_ENTRY';

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "category" "AuditCategory" NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "college_verifications" ADD COLUMN     "offerLetterVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerLetterVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "offerLetterVerifiedByUserId" TEXT;

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "branch" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "channel" "NotificationChannel",
ADD COLUMN     "deliveryStatus" "NotificationDeliveryStatus";

-- CreateTable
CREATE TABLE "disbursement_conditions" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "DisbursementConditionStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursement_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursements" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'PENDING',
    "totalDisbursedAmount" DECIMAL(18,2),
    "initiatedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursement_tranches" (
    "id" TEXT NOT NULL,
    "disbursementId" TEXT NOT NULL,
    "trancheNumber" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "accountCredited" TEXT,
    "status" "TrancheStatus" NOT NULL DEFAULT 'PENDING',
    "disbursedAt" TIMESTAMP(3),
    "commissionAmount" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursement_tranches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emi_schedule_entries" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "emiAmount" DECIMAL(18,2) NOT NULL,
    "principalComponent" DECIMAL(18,2) NOT NULL,
    "interestComponent" DECIMAL(18,2) NOT NULL,
    "outstandingPrincipal" DECIMAL(18,2) NOT NULL,
    "status" "EmiStatus" NOT NULL DEFAULT 'UPCOMING',
    "paidAmount" DECIMAL(18,2) DEFAULT 0,
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emi_schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_agreements" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "agreementType" "GeneratedAgreementType" NOT NULL,
    "status" "GeneratedAgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "templateSnapshot" JSONB,
    "documentUrl" TEXT,
    "generatedByUserId" TEXT NOT NULL,
    "sentToSignAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "insurer" TEXT NOT NULL,
    "policyType" TEXT,
    "sumInsured" DECIMAL(18,2) NOT NULL,
    "premiumAmount" DECIMAL(18,2),
    "startDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "addedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_partners" (
    "id" TEXT NOT NULL,
    "partnerType" "CommissionPartnerType" NOT NULL,
    "name" TEXT NOT NULL,
    "rateType" "CommissionRateType" NOT NULL,
    "rateValue" DECIMAL(10,4) NOT NULL,
    "mouReference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_entries" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "partnerId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "status" "CommissionEntryStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disbursement_conditions_applicationId_idx" ON "disbursement_conditions"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "disbursements_applicationId_key" ON "disbursements"("applicationId");

-- CreateIndex
CREATE INDEX "disbursement_tranches_disbursementId_idx" ON "disbursement_tranches"("disbursementId");

-- CreateIndex
CREATE INDEX "emi_schedule_entries_applicationId_idx" ON "emi_schedule_entries"("applicationId");

-- CreateIndex
CREATE INDEX "emi_schedule_entries_dueDate_idx" ON "emi_schedule_entries"("dueDate");

-- CreateIndex
CREATE INDEX "emi_schedule_entries_status_idx" ON "emi_schedule_entries"("status");

-- CreateIndex
CREATE INDEX "generated_agreements_applicationId_idx" ON "generated_agreements"("applicationId");

-- CreateIndex
CREATE INDEX "insurance_policies_applicationId_idx" ON "insurance_policies"("applicationId");

-- CreateIndex
CREATE INDEX "insurance_policies_expiryDate_idx" ON "insurance_policies"("expiryDate");

-- CreateIndex
CREATE INDEX "commission_entries_applicationId_idx" ON "commission_entries"("applicationId");

-- CreateIndex
CREATE INDEX "commission_entries_partnerId_idx" ON "commission_entries"("partnerId");

-- CreateIndex
CREATE INDEX "commission_entries_month_idx" ON "commission_entries"("month");

-- CreateIndex
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");

-- AddForeignKey
ALTER TABLE "disbursement_conditions" ADD CONSTRAINT "disbursement_conditions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_tranches" ADD CONSTRAINT "disbursement_tranches_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "disbursements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emi_schedule_entries" ADD CONSTRAINT "emi_schedule_entries_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_agreements" ADD CONSTRAINT "generated_agreements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_entries" ADD CONSTRAINT "commission_entries_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "commission_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

