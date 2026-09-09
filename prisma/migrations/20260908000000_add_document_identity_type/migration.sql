-- AlterTable
-- Nullable and additive only — existing rows get NULL (no prior data can be
-- retroactively attributed to a specific identity type, since that
-- information was never captured before this migration). No existing
-- documents are modified or deleted.
ALTER TABLE "documents" ADD COLUMN     "identityType" "IdentityType";
