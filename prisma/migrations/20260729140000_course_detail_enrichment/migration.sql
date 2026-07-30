-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "accreditation" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "attendanceType" TEXT,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "careerOutcomes" JSONB,
ADD COLUMN     "credits" INTEGER,
ADD COLUMN     "curriculum" JSONB,
ADD COLUMN     "industryDemand" TEXT,
ADD COLUMN     "intake" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "medium" TEXT;

