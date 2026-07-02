/*
  Warnings:

  - Changed the type of `creditFacilitySize` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dsgir` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `operationOfInstitution` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `satisfactoryPerformance` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `parentsBorrowingsWithBFIs` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sourceOfIncome` on the `credit_scores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "credit_scores" DROP COLUMN "creditFacilitySize",
ADD COLUMN     "creditFacilitySize" INTEGER NOT NULL,
DROP COLUMN "dsgir",
ADD COLUMN     "dsgir" INTEGER NOT NULL,
DROP COLUMN "operationOfInstitution",
ADD COLUMN     "operationOfInstitution" INTEGER NOT NULL,
DROP COLUMN "satisfactoryPerformance",
ADD COLUMN     "satisfactoryPerformance" INTEGER NOT NULL,
DROP COLUMN "parentsBorrowingsWithBFIs",
ADD COLUMN     "parentsBorrowingsWithBFIs" TEXT NOT NULL,
DROP COLUMN "sourceOfIncome",
ADD COLUMN     "sourceOfIncome" TEXT NOT NULL;

-- DropEnum
DROP TYPE "CreditFacilitySize";

-- DropEnum
DROP TYPE "Dsgir";

-- DropEnum
DROP TYPE "OperationOfInstitution";

-- DropEnum
DROP TYPE "ParentsBorrowingsWithBFIs";

-- DropEnum
DROP TYPE "SatisfactoryPerformance";

-- DropEnum
DROP TYPE "SourceOfIncome";
