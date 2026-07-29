ALTER TABLE "Insurance"
  DROP COLUMN "insuranceCoverage",
  DROP COLUMN "insuranceRemarks",
  DROP COLUMN "insuredAssets",
  DROP COLUMN "sumOfInsurance",
  DROP COLUMN "valueOfAssets",
  ADD COLUMN "insuranceCompanyName" TEXT,
  ADD COLUMN "insuredName" TEXT,
  ADD COLUMN "maturityDate" TIMESTAMP(3),
  ADD COLUMN "policyNo" TEXT,
  ADD COLUMN "sumInsured" DECIMAL(18,2);
