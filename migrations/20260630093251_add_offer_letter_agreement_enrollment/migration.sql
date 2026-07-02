-- CreateTable
CREATE TABLE "offer_letters" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "validUntilAD" TEXT,
    "validUntilBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "studentDobAD" TEXT,
    "studentDobBS" TEXT,
    "citizenshipNo" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "permanentAddress" TEXT,
    "district" TEXT,
    "province" TEXT,
    "programName" TEXT,
    "programFullName" TEXT,
    "programAffiliation" TEXT,
    "durationYears" INTEGER,
    "totalSemesters" INTEGER,
    "creditHours" INTEGER,
    "academicYearBS" TEXT,
    "intakeMonthBS" TEXT,
    "admissionFee" DECIMAL(14,2),
    "tuitionPerSem" DECIMAL(14,2),
    "examFeePerSem" DECIMAL(14,2),
    "labFeePerSem" DECIMAL(14,2),
    "totalApprox" DECIMAL(14,2),
    "conditions" JSONB,
    "signatories" JSONB,
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "tuRollNo" TEXT,
    "enrollmentNo" TEXT,
    "programName" TEXT,
    "currentYear" TEXT,
    "currentSemester" TEXT,
    "academicYearBS" TEXT,
    "studentStatus" TEXT,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT true,
    "hasBacklogs" BOOLEAN NOT NULL DEFAULT false,
    "disciplinaryHold" BOOLEAN NOT NULL DEFAULT false,
    "feeDueRs" DECIMAL(14,2),
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_certificates" (
    "id" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeCode" TEXT,
    "collegeAddress" TEXT,
    "collegeRegNo" TEXT,
    "collegeAffiliation" TEXT,
    "collegePhone" TEXT,
    "collegeEmail" TEXT,
    "collegeWebsite" TEXT,
    "logoUrl" TEXT,
    "refNo" TEXT NOT NULL,
    "issuedDateAD" TEXT,
    "issuedDateBS" TEXT,
    "studentFullName" TEXT NOT NULL,
    "tuRollNo" TEXT,
    "enrollmentNo" TEXT,
    "programName" TEXT,
    "currentYear" TEXT,
    "currentSemester" TEXT,
    "academicYearBS" TEXT,
    "studentStatus" TEXT,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT true,
    "hasBacklogs" BOOLEAN NOT NULL DEFAULT false,
    "disciplinaryHold" BOOLEAN NOT NULL DEFAULT false,
    "feeDueRs" DECIMAL(14,2),
    "qrToken" TEXT,
    "qrVerifyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollment_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offer_letters_createdByEmail_idx" ON "offer_letters"("createdByEmail");

-- CreateIndex
CREATE INDEX "agreements_createdByEmail_idx" ON "agreements"("createdByEmail");

-- CreateIndex
CREATE INDEX "enrollment_certificates_createdByEmail_idx" ON "enrollment_certificates"("createdByEmail");
