/*
  Warnings:

  - You are about to drop the column `familyStructureType` on the `loan_applications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FamilyMember_applicationId_key";

-- AlterTable
ALTER TABLE "loan_applications" DROP COLUMN "familyStructureType";

-- CreateIndex
CREATE INDEX "FamilyMember_applicationId_idx" ON "FamilyMember"("applicationId");
