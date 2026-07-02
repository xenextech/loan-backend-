import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateInitiatorApplicationDto {
  // =========================
  // 1. Basic Information
  // =========================

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsDateString()
  relationshipStartDate?: string;

  @IsOptional()
  @IsString()
  customerGroup?: string;

  @IsOptional()
  @IsNumber()
  obligorNo?: number;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  correspondenceAddress?: string;

  @IsOptional()
  @IsString()
  contactNo?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  repaymentSource?: string;

  @IsOptional()
  @IsString()
  citizenshipNo?: string;

  @IsOptional()
  @IsDateString()
  citizenshipIssuedDate?: string;

  @IsOptional()
  @IsString()
  citizenshipIssuedPlace?: string;

  @IsOptional()
  @IsString()
  nidNo?: string;

  @IsOptional()
  @IsString()
  panNo?: string;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsString()
  bankingRelationship?: string;

  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;

  // =========================
  // 2. NRB Reporting
  // =========================

  @IsOptional()
  @IsString()
  baselClassification?: string;

  @IsOptional()
  @IsNumber()
  baselRiskWeight?: number;

  @IsOptional()
  @IsString()
  nrb93SectorCode?: string;

  @IsOptional()
  @IsString()
  nrb93KaProductCode?: string;

  @IsOptional()
  @IsString()
  nrb94SecurityTypeCode?: string;

  @IsOptional()
  @IsString()
  sis0IndustrialClassification?: string;

  @IsOptional()
  @IsString()
  sis1ProductType?: string;

  @IsOptional()
  @IsString()
  sis2Sector?: string;

  @IsOptional()
  @IsString()
  sis3Security?: string;

  @IsOptional()
  @IsString()
  sis4InstitutionalGroupingOfBorrower?: string;

  @IsOptional()
  @IsString()
  sis9PriorityLending?: string;

  @IsOptional()
  @IsString()
  greenFinanceEconomicSector?: string;

  @IsOptional()
  @IsString()
  greenFinanceSubSector?: string;

  @IsOptional()
  @IsString()
  greenFinanceTaxonomyTag?: string;

  // =========================
  // 3. Credit Scoring
  // =========================

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsString()
  creditFacilitySize?: string;

  @IsOptional()
  @IsNumber()
  loanToValueRatio?: number;

  @IsOptional()
  @IsNumber()
  dsgir?: number;

  @IsOptional()
  @IsNumber()
  performanceYears?: number;

  @IsOptional()
  @IsNumber()
  bankingRelationshipScore?: number;

  @IsOptional()
  @IsNumber()
  parentsBorrowingsWithBFIs?: number;

  @IsOptional()
  @IsNumber()
  sourceOfIncomeScore?: number;

  @IsOptional()
  @IsNumber()
  operationOfInstitution?: number;

  @IsOptional()
  @IsString()
  creditRiskScoring?: string;

  @IsOptional()
  @IsString()
  riskGrade?: string;

  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsNumber()
  totalPercentage?: number;

  // =========================
  // 4. Applicant Background
  // =========================

  @IsOptional()
  @IsString()
  familyPersonName?: string;

  @IsOptional()
  @IsNumber()
  familyAge?: number;

  @IsOptional()
  @IsString()
  familyQualification?: string;

  @IsOptional()
  @IsString()
  relationshipWithBorrower?: string;

  @IsOptional()
  @IsString()
  occupationSocialInvolvement?: string;

  @IsOptional()
  @IsString()
  facility?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsNumber()
  facilityLimit?: number;

  @IsOptional()
  @IsNumber()
  period?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  // =========================
  // 5. Security
  // =========================

  @IsOptional()
  @IsString()
  securityDetails?: string;

  @IsOptional()
  @IsNumber()
  fmv?: number;

  @IsOptional()
  @IsNumber()
  proposedLoan?: number;

  @IsOptional()
  @IsNumber()
  financeAgainstFmv?: number;

  // =========================
  // 6. Personal Guarantee
  // =========================

  @IsOptional()
  @IsString()
  guarantorName?: string;

  @IsOptional()
  @IsString()
  guarantorRelationship?: string;

  @IsOptional()
  @IsNumber()
  guarantorAge?: number;

  @IsOptional()
  @IsNumber()
  guarantorNetWorth?: number;

  @IsOptional()
  @IsBoolean()
  guarantorConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  ciclStatus?: boolean;

  @IsOptional()
  @IsString()
  ciclRemarks?: string;

  @IsOptional()
  @IsDateString()
  blackListedDate?: string;

  @IsOptional()
  @IsDateString()
  releasedDate?: string;

  // =========================
  // 7. Insurance
  // =========================

  @IsOptional()
  @IsString()
  insuredAssets?: string;

  @IsOptional()
  @IsNumber()
  valueOfAssets?: number;

  @IsOptional()
  @IsNumber()
  sumOfInsurance?: number;

  @IsOptional()
  @IsString()
  insuranceRemarks?: string;

  @IsOptional()
  @IsNumber()
  insuranceCoverage?: number;

  // =========================
  // 8. Repayment Capacity
  // =========================

  @IsOptional()
  @IsNumber()
  repaymentInsuredAssets?: number;

  @IsOptional()
  @IsNumber()
  repaymentValueOfAssets?: number;

  @IsOptional()
  @IsNumber()
  repaymentSumOfInsurance?: number;

  @IsOptional()
  @IsString()
  repaymentInsuranceRemarks?: string;

  @IsOptional()
  @IsNumber()
  repaymentInsuranceCoverage?: number;

  // =========================
  // 9–17
  // =========================

  @IsOptional()
  @IsString()
  amlRisk?: string;

  @IsOptional()
  @IsString()
  waiver?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  bankingRelationshipRemarks?: string;

  @IsOptional()
  @IsString()
  keyCreditRiskMitigation?: string;

  @IsOptional()
  @IsString()
  justificationOfLoan?: string;

  @IsOptional()
  @IsString()
  accountStrategy?: string;

  @IsOptional()
  @IsString()
  disbursementSection?: string;

  @IsOptional()
  @IsString()
  utilizationOfFund?: string;

  @IsOptional()
  @IsString()
  conclusionAndRecommendation?: string;
}
