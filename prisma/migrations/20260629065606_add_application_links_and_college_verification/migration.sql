-- CreateEnum
CREATE TYPE "ApplicationLinkType" AS ENUM ('PARENT', 'COLLEGE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'APPLICATION_LINK_GENERATED';
ALTER TYPE "AuditAction" ADD VALUE 'COLLEGE_FORM_SUBMITTED';

-- CreateTable
CREATE TABLE "application_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "linkType" "ApplicationLinkType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_verifications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "collegeName" TEXT,
    "collegeEmail" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "isApplicationVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationNotes" TEXT,
    "offerLetterFileName" TEXT,
    "offerLetterOriginalFileName" TEXT,
    "offerLetterMimeType" TEXT,
    "offerLetterSize" INTEGER,
    "offerLetterBucketName" TEXT,
    "offerLetterFilePath" TEXT,
    "offerLetterPublicUrl" TEXT,
    "enrollmentDocFileName" TEXT,
    "enrollmentDocOriginalFileName" TEXT,
    "enrollmentDocMimeType" TEXT,
    "enrollmentDocSize" INTEGER,
    "enrollmentDocBucketName" TEXT,
    "enrollmentDocFilePath" TEXT,
    "enrollmentDocPublicUrl" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_links_token_key" ON "application_links"("token");

-- CreateIndex
CREATE INDEX "application_links_token_idx" ON "application_links"("token");

-- CreateIndex
CREATE INDEX "application_links_applicationId_idx" ON "application_links"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "college_verifications_applicationId_key" ON "college_verifications"("applicationId");

-- AddForeignKey
ALTER TABLE "application_links" ADD CONSTRAINT "application_links_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_verifications" ADD CONSTRAINT "college_verifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
