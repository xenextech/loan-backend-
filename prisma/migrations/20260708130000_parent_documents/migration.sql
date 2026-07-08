-- CreateEnum
CREATE TYPE "ParentDocumentType" AS ENUM ('NID', 'PAN_ID', 'SALARY_SHEET');

-- CreateTable
CREATE TABLE "parent_documents" (
    "id" TEXT NOT NULL,
    "parentVerificationId" TEXT NOT NULL,
    "documentType" "ParentDocumentType" NOT NULL,
    "label" TEXT,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "bucketName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parent_documents_parentVerificationId_idx" ON "parent_documents"("parentVerificationId");

-- AddForeignKey
ALTER TABLE "parent_documents" ADD CONSTRAINT "parent_documents_parentVerificationId_fkey" FOREIGN KEY ("parentVerificationId") REFERENCES "parent_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
