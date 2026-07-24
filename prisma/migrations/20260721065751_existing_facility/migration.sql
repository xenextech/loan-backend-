-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('PERFORMING', 'OVERDUE', 'NPA', 'CLOSED');

-- CreateTable
CREATE TABLE "ExistingFacility" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "facilityType" TEXT,
    "bank" TEXT,
    "sanctionedLimit" DECIMAL(18,2),
    "outstanding" DECIMAL(18,2),
    "status" "FacilityStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExistingFacility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExistingFacility_applicationId_idx" ON "ExistingFacility"("applicationId");

-- AddForeignKey
ALTER TABLE "ExistingFacility" ADD CONSTRAINT "ExistingFacility_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
