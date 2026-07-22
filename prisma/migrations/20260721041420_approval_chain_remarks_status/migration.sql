-- CreateEnum
CREATE TYPE "ApprovalEntryStatus" AS ENUM ('PENDING', 'WAITING', 'UNDER_REVIEW', 'FIELD_VERIFIED', 'APPROVED', 'REJECTED', 'SENT_BACK');

-- AlterTable
-- Per-role remarks/status for the Initiator wizard's in-form approval chain
-- (Step 9) — the corresponding *Name/*Post/*Date/*Signature columns already
-- existed but were unused by this feature until now.
ALTER TABLE "loan_applications" ADD COLUMN "initiatorRemarks" TEXT,
ADD COLUMN "initiatorStatus" "ApprovalEntryStatus",
ADD COLUMN "supporterRemarks" TEXT,
ADD COLUMN "supporterStatus" "ApprovalEntryStatus",
ADD COLUMN "checkerRemarks" TEXT,
ADD COLUMN "checkerStatus" "ApprovalEntryStatus",
ADD COLUMN "approverRemarks" TEXT,
ADD COLUMN "approverStatus" "ApprovalEntryStatus";
