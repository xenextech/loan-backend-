-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'PARENT';
ALTER TYPE "UserRole" ADD VALUE 'COLLEGE';

-- CreateTable
CREATE TABLE "parent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "contact" TEXT,
    "citizenshipNumber" TEXT,
    "salaryBankName" TEXT,
    "bankAccountNumber" TEXT,
    "salarySheetFileName" TEXT,
    "salarySheetOriginalFileName" TEXT,
    "salarySheetMimeType" TEXT,
    "salarySheetSize" INTEGER,
    "salarySheetBucketName" TEXT,
    "salarySheetFilePath" TEXT,
    "salarySheetPublicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parent_profiles_userId_key" ON "parent_profiles"("userId");

-- AddForeignKey
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
