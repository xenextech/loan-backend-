-- AlterTable
ALTER TABLE "generated_agreements" ADD COLUMN "documentNumber" TEXT,
ADD COLUMN "generatedByName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "generated_agreements_documentNumber_key" ON "generated_agreements"("documentNumber");
