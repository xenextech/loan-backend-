-- AlterTable
-- Additive and nullable. Separates "a draft row exists because the wizard is
-- open" (draftSavedAt IS NULL — a scratch application, hidden from the
-- student's Drafts list and discarded when they start a new application)
-- from "the student explicitly clicked Save as Draft" (draftSavedAt set).
ALTER TABLE "loan_applications" ADD COLUMN     "draftSavedAt" TIMESTAMP(3);

-- Backfill: every DRAFT that already existed before this column predates the
-- explicit Save-as-Draft action, and its owner has been seeing it in their
-- Drafts list all along — treat those as explicitly saved (using their last
-- update time) so nobody's visible draft silently disappears on deploy.
UPDATE "loan_applications"
SET "draftSavedAt" = "updatedAt"
WHERE "status" = 'DRAFT' AND "draftSavedAt" IS NULL;
