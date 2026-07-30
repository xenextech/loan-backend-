-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('ENGINEERING', 'MANAGEMENT', 'IT_COMPUTER_SCIENCE', 'MEDICINE_HEALTH_SCIENCE', 'SCIENCE', 'HUMANITIES_SOCIAL_SCIENCE', 'LAW', 'EDUCATION', 'HOSPITALITY_TOURISM', 'AGRICULTURE', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COLLEGE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COLLEGE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COLLEGE_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COURSE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COURSE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'MARKETPLACE_COURSE_DELETED';

-- AlterTable
ALTER TABLE "loan_applications" ADD COLUMN     "collegeId" TEXT;

-- AlterTable
ALTER TABLE "study_information" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "tuitionFee" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "address" TEXT,
    "province" TEXT,
    "district" TEXT,
    "municipality" TEXT,
    "universityId" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "eligibility" TEXT,
    "requiredDocs" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "CourseCategory" NOT NULL,
    "degreeLevel" "DegreeLevel" NOT NULL,
    "duration" TEXT NOT NULL,
    "durationMonths" INTEGER,
    "description" TEXT,
    "eligibility" TEXT,
    "seatsAvailable" INTEGER,
    "tuitionFee" DECIMAL(12,2) NOT NULL,
    "admissionFee" DECIMAL(12,2),
    "totalFee" DECIMAL(12,2) NOT NULL,
    "feeBreakdown" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_province_district_idx" ON "colleges"("province", "district");

-- CreateIndex
CREATE INDEX "colleges_universityId_idx" ON "colleges"("universityId");

-- CreateIndex
CREATE INDEX "courses_collegeId_idx" ON "courses"("collegeId");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- CreateIndex
CREATE INDEX "courses_degreeLevel_idx" ON "courses"("degreeLevel");

-- CreateIndex
CREATE INDEX "courses_tuitionFee_idx" ON "courses"("tuitionFee");

-- CreateIndex
CREATE UNIQUE INDEX "courses_collegeId_slug_key" ON "courses"("collegeId", "slug");

-- CreateIndex
CREATE INDEX "loan_applications_collegeId_idx" ON "loan_applications"("collegeId");

-- CreateIndex
CREATE INDEX "study_information_courseId_idx" ON "study_information"("courseId");

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_information" ADD CONSTRAINT "study_information_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

