-- AlterTable
ALTER TABLE "application_links" ADD COLUMN     "recipientEmail" TEXT;

-- CreateIndex
CREATE INDEX "application_links_recipientEmail_idx" ON "application_links"("recipientEmail");
