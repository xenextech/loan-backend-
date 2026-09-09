-- AlterTable
-- Additive only. Existing rows (including any draft currently in progress at
-- deploy time) default to 1 — their actual saved step data is unaffected and
-- still restores correctly; only the wizard's resume *page* falls back to
-- Step 1 for that one-time cutover, since which page an in-flight draft was
-- last on was never previously recorded anywhere to backfill from.
ALTER TABLE "loan_applications" ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 1;
