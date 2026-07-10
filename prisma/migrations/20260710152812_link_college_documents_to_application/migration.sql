-- AlterTable
ALTER TABLE "offer_letters" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "agreements" ADD COLUMN     "applicationId" TEXT;

-- AlterTable
ALTER TABLE "enrollment_certificates" ADD COLUMN     "applicationId" TEXT;

-- CreateIndex
CREATE INDEX "offer_letters_applicationId_idx" ON "offer_letters"("applicationId");

-- CreateIndex
CREATE INDEX "agreements_applicationId_idx" ON "agreements"("applicationId");

-- CreateIndex
CREATE INDEX "enrollment_certificates_applicationId_idx" ON "enrollment_certificates"("applicationId");

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_certificates" ADD CONSTRAINT "enrollment_certificates_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
