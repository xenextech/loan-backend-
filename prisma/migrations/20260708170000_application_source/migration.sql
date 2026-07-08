-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('STUDENT', 'INITIATOR');

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "source" "ApplicationSource" NOT NULL DEFAULT 'STUDENT';

-- CreateIndex
CREATE INDEX "loan_applications_source_idx" ON "loan_applications"("source");
