import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMoneyAmount,
  IsPercentage,
  IsRatioPercentage,
} from '../../../common/decorators/numeric-range.decorators';
import {
  ApprovalEntryStatus,
  BlacklistStatus,
  FacilityStatus,
} from '../../../common/enums';
import {
  ParentsBorrowingsWithBFIs,
  SourceOfIncome,
} from '../../creditScore/enum/credit-score.enum';
import { RiskCategory } from '../../creditScore/constant/credit-parameters.constant';

export class FamilyMemberDto {
  @ApiPropertyOptional({
    description: 'Name of the family member or co-applicant',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  personName?: string;

  @ApiPropertyOptional({ description: 'Age of the family member', example: 42 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120, { message: 'age must not exceed 120' })
  age?: number;

  @ApiPropertyOptional({
    description:
      'Educational or professional qualifications of the family member',
    example: "Master's Degree",
  })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({
    description: 'Relationship matrix tie to the borrower entity',
    example: 'Spouse',
  })
  @IsOptional()
  @IsString()
  relationshipWithBorrower?: string;

  @ApiPropertyOptional({
    description: 'Details on occupation and community social involvements',
    example: 'Business Owner & Rotary Member',
  })
  @IsOptional()
  @IsString()
  occupationSocialInvolvement?: string;
}

export class ExistingFacilityDto {
  @ApiPropertyOptional({
    description: 'Type of the existing credit facility',
    example: 'Term Loan',
  })
  @IsOptional()
  @IsString()
  facilityType?: string;

  @ApiPropertyOptional({
    description: 'Bank / BFI holding this facility',
    example: 'Nepal Bank Limited',
  })
  @IsOptional()
  @IsString()
  bank?: string;

  @ApiPropertyOptional({
    description: 'Sanctioned limit of the existing facility',
    example: 2000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  sanctionedLimit?: number;

  @ApiPropertyOptional({
    description: 'Current outstanding balance on the existing facility',
    example: 850000,
  })
  @IsOptional()
  @IsMoneyAmount()
  outstanding?: number;

  @ApiPropertyOptional({
    enum: FacilityStatus,
    description: 'Repayment status of the existing facility',
  })
  @IsOptional()
  @IsEnum(FacilityStatus)
  status?: FacilityStatus;
}

export class PersonalGuaranteeDto {
  @ApiPropertyOptional({
    description: 'Full legal name of the individual personal guarantor',
    example: 'Robert Doe',
  })
  @IsOptional()
  @IsString()
  nameOfGuarantor?: string;

  @ApiPropertyOptional({
    description: 'Relationship bond details of the guarantor to the borrower',
    example: 'Brother',
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({
    description: 'Age of the personal guarantor',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120, { message: 'age must not exceed 120' })
  age?: number;

  @ApiPropertyOptional({
    description: 'Estimated individual net worth evaluation of the guarantor',
    example: 15000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  netWorth?: number;

  @ApiPropertyOptional({
    description:
      'Confirmation flag verifying guarantor formal consent was acquired',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  guarantorConsent?: boolean;

  @ApiPropertyOptional({
    description:
      'Credit Information Bureau (CICL) report status assessment clearance flag',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  ciclStatus?: boolean;

  @ApiPropertyOptional({
    description:
      'Qualitative remarks regarding the CICL credit report output tracking history',
    example: 'No defaults flagged in reporting history.',
  })
  @IsOptional()
  @IsString()
  ciclRemarks?: string;

  @ApiPropertyOptional({
    description: 'Historical blacklisted date timestamp entries if applicable',
    example: '2020-11-02T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  blackListedDate?: string;

  @ApiPropertyOptional({
    description: 'Release date records from official credit blacklists',
    example: '2022-04-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  releasedDate?: string;
}

export class RepaymentCapacityDto {
  @ApiPropertyOptional({
    description:
      'Repayment-allocated asset metrics tied to functional coverage calculations',
    example: 5000000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647, { message: 'insuredAssets must not exceed 2147483647' })
  insuredAssets?: number;

  @ApiPropertyOptional({
    description:
      'Valuation criteria scores tied directly to active repayment streams',
    example: 6000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  valueOfAssets?: number;

  @ApiPropertyOptional({
    description:
      'Calculated summation totals dedicated for repayment stream insurance buffers',
    example: 6500000,
  })
  @IsOptional()
  @IsMoneyAmount()
  sumOfInsurance?: number;

  @ApiPropertyOptional({
    description:
      'Ancillary contextual reporting notes monitoring specific coverage metrics',
    example: 'Primary asset base aligns to secondary cash streams.',
  })
  @IsOptional()
  @IsString()
  insuranceRemarks?: string;

  @ApiPropertyOptional({
    description:
      'Total designated metrics accounting for structural insurance buffer safety limits',
    example: 90,
  })
  @IsOptional()
  @IsPercentage()
  insuranceCoverage?: number;
}

// ─── Step 9 — Approval Chain ────────────────────────────────────────────────
// Maps onto the pre-existing per-role Name/Post/Date/Signature columns on
// LoanApplication (see schema.prisma's "Approval Section") plus the newer
// per-role Remarks/Status columns — see
// ApplicationInitiatorService.buildApprovalUpdate() for the flattening.

export class ApprovalEntryDto {
  @ApiPropertyOptional({
    description: "This role's signer name, as shown on the approval card",
    example: 'Ram Prasad Sharma',
  })
  @IsOptional()
  @IsString()
  approverName?: string;

  @ApiPropertyOptional({
    enum: ApprovalEntryStatus,
    description: "This role's own sign-off status within the approval chain",
  })
  @IsOptional()
  @IsEnum(ApprovalEntryStatus)
  status?: ApprovalEntryStatus;

  @ApiPropertyOptional({
    description: 'Date this role acted (approved/rejected/etc.)',
    example: '2026-07-21',
  })
  @IsOptional()
  @IsISO8601()
  approvedDate?: string;

  @ApiPropertyOptional({
    description: "This role's remarks on the application",
    example: 'Documents verified, no discrepancies found.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: "This role's digital signature placeholder value",
    example: 'signed-by-ram-sharma',
  })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({
    description: "This role's designation/job title within the approval chain",
    example: 'ARO (Assistant Relationship Officer) - Initiator',
  })
  @IsOptional()
  @IsString()
  designation?: string;
}

export class InitiatorApprovalEntryDto extends ApprovalEntryDto {
  @ApiPropertyOptional({
    description:
      "The initiator's branch. Stored on the application's top-level branch " +
      'field, not a per-role column, since only the Initiator collects this.',
    example: 'Kathmandu Branch',
  })
  @IsOptional()
  @IsString()
  branchName?: string;
}

export class ApprovalChainDto {
  @ApiPropertyOptional({ type: () => InitiatorApprovalEntryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitiatorApprovalEntryDto)
  initiator?: InitiatorApprovalEntryDto;

  @ApiPropertyOptional({ type: () => ApprovalEntryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApprovalEntryDto)
  support?: ApprovalEntryDto;

  @ApiPropertyOptional({ type: () => ApprovalEntryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApprovalEntryDto)
  checker?: ApprovalEntryDto;

  @ApiPropertyOptional({ type: () => ApprovalEntryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApprovalEntryDto)
  approver?: ApprovalEntryDto;
}

export class UpdateInitiatorApplicationDto {
  // =========================
  // 1. Basic Information
  // =========================

  @ApiPropertyOptional({
    description: 'Name of the customer',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Start date of banking relationship',
    example: '2023-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  relationshipStartDate?: string;

  @ApiPropertyOptional({
    description: 'Group name if the customer belongs to a corporate group',
    example: 'ABC Group',
  })
  @IsOptional()
  @IsString()
  customerGroup?: string;

  @ApiPropertyOptional({
    description: 'Unique obligor number assigned to the customer',
    example: 102938,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647, { message: 'obligorNumber must not exceed 2147483647' })
  obligorNumber?: number;

  @ApiPropertyOptional({
    description: 'Permanent residential or registered address',
    example: 'Kathmandu, Nepal',
  })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional({
    description: 'Mailing or correspondence address',
    example: 'Lalitpur, Nepal',
  })
  @IsOptional()
  @IsString()
  correspondenceAddress?: string;

  @ApiPropertyOptional({
    description: 'Primary contact phone number',
    example: '+977-9801234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Profession or line of business',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    description: 'Primary source of loan repayment',
    example: 'Salary / Business Revenue',
  })
  @IsOptional()
  @IsString()
  repaymentSource?: string;

  @ApiPropertyOptional({
    description: 'Citizenship certificate number',
    example: '12-34-56-7890',
  })
  @IsOptional()
  @IsString()
  citizenshipNumber?: string;

  @ApiPropertyOptional({
    description: 'Date of citizenship issuance',
    example: '2015-05-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  citizenshipIssuedDate?: string;

  @ApiPropertyOptional({
    description: 'District where citizenship was issued',
    example: 'Kathmandu',
  })
  @IsOptional()
  @IsString()
  citizenshipIssuedPlace?: string;

  @ApiPropertyOptional({
    description: 'National Identity Card (NID) number',
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  nidNumber?: string;

  @ApiPropertyOptional({
    description: 'Permanent Account Number (PAN)',
    example: '601234567',
  })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional({
    description: 'Driving or business license number',
    example: '01-23-4567',
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Summary of history with the bank',
    example: 'Good history over 5 years',
  })
  @IsOptional()
  @IsString()
  bankingRelationship?: string;

  // Collected only when bankingRelationship is "EXISTING".
  @ApiPropertyOptional({
    description: 'Name of the bank for the existing account',
    example: 'Nepal Bank Limited',
  })
  @IsOptional()
  @IsString()
  existingBankName?: string;

  @ApiPropertyOptional({
    description: 'Existing account number',
    example: '0123456789012',
  })
  @IsOptional()
  @IsString()
  existingBankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Existing savings account balance',
    example: 150000,
  })
  @IsOptional()
  @IsMoneyAmount()
  existingBankSavingsAmount?: number;

  @ApiPropertyOptional({
    description: 'Existing outstanding loan amount at the bank',
    example: 200000,
  })
  @IsOptional()
  @IsMoneyAmount()
  existingBankLoanAmount?: number;

  @ApiPropertyOptional({
    description: 'Flag indicating if the customer is blacklisted by CICL/NRB',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;

  @ApiPropertyOptional({
    enum: BlacklistStatus,
    description:
      'Blacklist status. When NOT_BLACKLISTED, blacklistReason/blacklistDate/' +
      'blacklistReferenceNumber must all be empty or absent. When BLACKLISTED, ' +
      'all three become required (checked against the merged stored + incoming ' +
      'state, not just this request — see ApplicationInitiatorService).',
  })
  @IsOptional()
  @IsEnum(BlacklistStatus)
  blacklistStatus?: BlacklistStatus;

  @ApiPropertyOptional({
    description:
      'Reason for blacklisting. Required when blacklistStatus is BLACKLISTED; ' +
      'must be empty/absent when NOT_BLACKLISTED. Send an empty string to ' +
      'clear a previously-set value.',
    example: 'Fraud',
  })
  @IsOptional()
  @IsString()
  blacklistReason?: string;

  @ApiPropertyOptional({
    description:
      'Date the customer was blacklisted (YYYY-MM-DD). Required when ' +
      'blacklistStatus is BLACKLISTED; must be empty/absent when ' +
      'NOT_BLACKLISTED. Send an empty string to clear a previously-set value.',
    example: '2026-07-08',
  })
  @ValidateIf((o: UpdateInitiatorApplicationDto) => !!o.blacklistDate)
  @IsDateString()
  blacklistDate?: string;

  @ApiPropertyOptional({
    description:
      'Reference number for the blacklist record. Required when ' +
      'blacklistStatus is BLACKLISTED; must be empty/absent when ' +
      'NOT_BLACKLISTED. Send an empty string to clear a previously-set value.',
    example: 'BL-001',
  })
  @IsOptional()
  @IsString()
  blacklistReferenceNumber?: string;

  // =========================
  // 2. NRB Reporting
  // =========================

  @ApiPropertyOptional({
    description:
      'Basel classification category. Fixed education-loan mapping: ' +
      '"Regulatory Retail Portfolio (RRP)" (credit limit up to NPR 25M, 75% risk weight), ' +
      '"Claims on domestic corporate (Unrated)" (above NPR 25M, 100%), or ' +
      '"Past due claims" (150%). Free text so a bank-assigned override can still be saved.',
    example: 'Regulatory Retail Portfolio (RRP)',
  })
  @IsOptional()
  @IsString()
  baselClassification?: string;

  @ApiPropertyOptional({
    description:
      'Basel risk weight percentage value. Derived from baselClassification (75 / 100 / 150) ' +
      'but editable/overridable.',
    example: 75,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150, { message: 'baselRiskWeight must be between 0 and 150' })
  baselRiskWeight?: number;

  @ApiPropertyOptional({
    description:
      'NRB Directive 9.3 Sector Code. Fixed education-loan coding: "NF Education Loan". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'NF Education Loan',
  })
  @IsOptional()
  @IsString()
  nrb93SectorCode?: string;

  @ApiPropertyOptional({
    description:
      'NRB Directive 9.3(Ka) Product Code. Fixed education-loan coding: "KB Education Loan". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'KB Education Loan',
  })
  @IsOptional()
  @IsString()
  nrb93KaProductCode?: string;

  @ApiPropertyOptional({
    description:
      'NRB Directive 9.4 Security Type Code. Fixed education-loan coding: "JC Personal Guarantee". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'JC Personal Guarantee',
  })
  @IsOptional()
  @IsString()
  nrb94SecurityTypeCode?: string;

  @ApiPropertyOptional({
    description: 'SIS Industrial Classification code',
    example: 'SIS-IND-45',
  })
  @IsOptional()
  @IsString()
  sis0IndustrialClassification?: string;

  @ApiPropertyOptional({
    description:
      'SIS 1 Product Type identifier. Fixed education-loan coding: "A4 Long Term Loan – Others". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'A4 Long Term Loan – Others',
  })
  @IsOptional()
  @IsString()
  sis1ProductType?: string;

  @ApiPropertyOptional({
    description:
      'SIS 2 Sector specification. Fixed education-loan coding: "PB Education Loan". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'PB Education Loan',
  })
  @IsOptional()
  @IsString()
  sis2Sector?: string;

  @ApiPropertyOptional({
    description:
      'SIS 3 Security details tag. Fixed education-loan coding: "EA Personal Guarantee". ' +
      'Free text so a bank-assigned override can still be saved.',
    example: 'EA Personal Guarantee',
  })
  @IsOptional()
  @IsString()
  sis3Security?: string;

  @ApiPropertyOptional({
    description:
      'SIS 4 Institutional Grouping of Borrower classification. Fixed coding: "FA (Male)" or ' +
      '"FB (Female)". Free text so a bank-assigned override can still be saved.',
    example: 'FA (Male)',
  })
  @IsOptional()
  @IsString()
  sis4InstitutionalGroupingOfBorrower?: string;

  @ApiPropertyOptional({
    description: 'SIS Priority Lending flag or code',
    example: 'Agriculture-01',
  })
  @IsOptional()
  @IsString()
  sis9PriorityLending?: string;

  @ApiPropertyOptional({
    description: 'Green Finance economic sector category',
    example: 'Renewable Energy',
  })
  @IsOptional()
  @IsString()
  greenFinanceEconomicSector?: string;

  @ApiPropertyOptional({
    description: 'Green Finance sub-sector classification',
    example: 'Solar Power',
  })
  @IsOptional()
  @IsString()
  greenFinanceSubSector?: string;

  @ApiPropertyOptional({
    description: 'Taxonomy tag tracking green finance compliance',
    example: 'TAX-GREEN-2026',
  })
  @IsOptional()
  @IsString()
  greenFinanceTaxonomyTag?: string;

  // =========================
  // 3. Credit Scoring
  // =========================

  @ApiPropertyOptional({
    description: 'Proposed or approved total credit limit amount',
    example: 5000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  creditLimit?: number;

  @ApiPropertyOptional({
    description:
      "Customer's assessed income, used alongside Credit Limit for underwriting",
    example: 800000,
  })
  @IsOptional()
  @IsMoneyAmount()
  income?: number;

  @ApiPropertyOptional({
    description:
      'Loan-to-Income ratio, %: (Credit Limit ÷ annual income) × 100. Can ' +
      "legitimately exceed 100 when the facility is larger than the applicant's " +
      'annual income — that is a real affordability signal, not invalid input.',
    example: 65.5,
  })
  @IsOptional()
  @IsRatioPercentage()
  loanToValueRatio?: number;

  @ApiPropertyOptional({
    description:
      'Debt Service to Gross Income Ratio (DSGIR), %: (total monthly debt ' +
      'obligations ÷ gross monthly income) × 100. Can legitimately exceed 100 ' +
      "— that signals the facility is unaffordable against the applicant's " +
      'income, not invalid data. Rounded to a whole percent on save (the ' +
      'column has no fractional precision).',
    example: 35,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'number' ? Math.round(value) : value,
  )
  @IsInt({ message: 'dsgir must be a whole number' })
  @Min(0, { message: 'dsgir cannot be negative' })
  @Max(9999, { message: 'dsgir is unrealistically large' })
  dsgir?: number;

  @ApiPropertyOptional({
    description: 'Number of operating/performance years recorded',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100, { message: 'performanceYears must not exceed 100' })
  performanceYears?: number;

  @ApiPropertyOptional({
    description: 'Calculated banking relationship score metric',
    example: 85,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100, { message: 'bankingRelationshipScore must be between 0 and 100' })
  bankingRelationshipScore?: number;

  @ApiPropertyOptional({
    enum: ParentsBorrowingsWithBFIs,
    description:
      "Whether the parents' existing BFI borrowings are with us or elsewhere — a scoring input, not a loan amount",
  })
  @IsOptional()
  @IsEnum(ParentsBorrowingsWithBFIs)
  parentsBorrowingsWithBFIs?: ParentsBorrowingsWithBFIs;

  @ApiPropertyOptional({
    enum: SourceOfIncome,
    description: 'Category of the source of income — a scoring input',
  })
  @IsOptional()
  @IsEnum(SourceOfIncome)
  sourceOfIncome?: SourceOfIncome;

  @ApiPropertyOptional({
    description: 'Assessed score for stability of income source',
    example: 90,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100, { message: 'sourceOfIncomeScore must be between 0 and 100' })
  sourceOfIncomeScore?: number;

  @ApiPropertyOptional({
    description: 'Operational assessment metric score of the enterprise',
    example: 78,
  })
  @IsOptional()
  @IsPercentage()
  operationOfInstitution?: number;

  @ApiPropertyOptional({
    description:
      "Years of the customer's satisfactory performance with the institution — a scoring input (CREDIT_PARAMETERS.satisfactoryPerformance)",
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100, { message: 'satisfactoryPerformance must not exceed 100' })
  satisfactoryPerformance?: number;

  @ApiPropertyOptional({
    enum: RiskCategory,
    description:
      'Overall credit risk scoring bucket — same categories the credit-scoring ' +
      'engine itself writes here after a score calculation (see ' +
      'CreditScoreService.saveCreditScoreParameterByApplicationId); manually ' +
      'setting it here lets the Initiator override that computed value.',
  })
  @IsOptional()
  @IsEnum(RiskCategory)
  creditRiskScoring?: RiskCategory;

  @ApiPropertyOptional({
    description: 'Final determined internal risk grade rating',
    example: 'Grade A',
  })
  @IsOptional()
  @IsString()
  riskGrade?: string;

  @ApiPropertyOptional({
    description: 'Aggregated raw scorecard numerical points',
    example: 425,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647, { message: 'totalScore must not exceed 2147483647' })
  totalScore?: number;

  @ApiPropertyOptional({
    description: 'Aggregated evaluation score calculated as a percentage',
    example: 85.4,
  })
  @IsOptional()
  @IsPercentage()
  totalPercentage?: number;

  // =========================
  // 4. Applicant Background
  // =========================

  @ApiPropertyOptional({
    description:
      'Family members / co-applicants linked to this application. Sending this array replaces the existing set of family members entirely.',
    type: () => [FamilyMemberDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDto)
  familyMembers?: FamilyMemberDto[];

  @ApiPropertyOptional({
    description:
      'Other credit facilities held at other banks/BFIs. Sending this array replaces the existing set entirely.',
    type: () => [ExistingFacilityDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExistingFacilityDto)
  existingFacilities?: ExistingFacilityDto[];

  @ApiPropertyOptional({
    description: 'Type of banking credit facility requested',
    example: 'Term Loan',
  })
  @IsOptional()
  @IsString()
  facility?: string;

  @ApiPropertyOptional({
    description: 'Intended core purpose of the credit facility',
    example: 'Working Capital Expansion',
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Financial sub-limit allocation for this specific facility',
    example: 3000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Repayment tenor period duration in months',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647, { message: 'period must not exceed 2147483647' })
  period?: number;

  @ApiPropertyOptional({
    description: 'Applied interest rate percentage per annum',
    example: 11.5,
  })
  @IsOptional()
  @IsPercentage({ message: 'Interest rate must be between 0 and 100' })
  interestRate?: number;

  @ApiPropertyOptional({
    description: 'Processing, upfront or management fee percentage/amount',
    example: 0.5,
  })
  @IsOptional()
  @IsMoneyAmount()
  fee?: number;

  @ApiPropertyOptional({
    description: 'General review remarks or annotations',
    example: 'Strong underlying applicant background.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  // =========================
  // 5. Security
  // =========================

  @ApiPropertyOptional({
    description:
      'Detailed descriptions of collateral and collateralized security',
    example: 'Land & building located at Ward 3, KMC',
  })
  @IsOptional()
  @IsString()
  securityDetails?: string;

  @ApiPropertyOptional({
    description: 'Fair Market Value (FMV) assessment valuation',
    example: 10000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  fmv?: number;

  @ApiPropertyOptional({
    description: 'Proposed loan segment drawing against collateral',
    example: 6000000,
  })
  @IsOptional()
  @IsMoneyAmount()
  proposedLoan?: number;

  @ApiPropertyOptional({
    description: 'Financing percentage approved against the Fair Market Value',
    example: 60,
  })
  @IsOptional()
  @IsPercentage()
  financeAgainstFmv?: number;

  // =========================
  // 6. Personal Guarantee
  // =========================

  @ApiPropertyOptional({
    description:
      'Personal guarantee details for this application. Sending this object replaces the existing personal guarantee entirely.',
    type: () => PersonalGuaranteeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalGuaranteeDto)
  personalGuarantee?: PersonalGuaranteeDto;

  // =========================
  // 7. Insurance
  // =========================

  @ApiPropertyOptional({
    description: 'Name of the person/entity the policy insures',
    example: 'Ram Prasad Sharma',
  })
  @IsOptional()
  @IsString()
  insuredName?: string;

  @ApiPropertyOptional({
    description: 'Insurance company underwriting the policy',
    example: 'IME General Insurance',
  })
  @IsOptional()
  @IsString()
  insuranceCompanyName?: string;

  @ApiPropertyOptional({
    description: 'Total sum insured under the policy',
    example: 8500000,
  })
  @IsOptional()
  @IsMoneyAmount()
  sumInsured?: number;

  @ApiPropertyOptional({
    description: 'Policy maturity / expiry date',
    example: '2027-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  maturityDate?: string;

  @ApiPropertyOptional({
    description: 'Insurance policy number',
    example: 'IMG-PROP-2080-092',
  })
  @IsOptional()
  @IsString()
  policyNo?: string;

  // =========================
  // 8. Repayment Capacity
  // =========================

  @ApiPropertyOptional({
    description:
      'Repayment capacity details for this application. Sending this object replaces the existing repayment capacity entirely.',
    type: () => RepaymentCapacityDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RepaymentCapacityDto)
  repaymentCapacity?: RepaymentCapacityDto;

  // =========================
  // 9–17
  // =========================

  @ApiPropertyOptional({
    description:
      'Anti-Money Laundering (AML) classification score status ranking',
    example: 'Low Risk',
  })
  @IsOptional()
  @IsString()
  amlRisk?: string;

  @ApiPropertyOptional({
    description:
      'Sanctioned process policy deviations or specific exception waivers allowed',
    example: 'Standard process waiver applied for documentation lag',
  })
  @IsOptional()
  @IsString()
  waiver?: string;

  @ApiPropertyOptional({
    description:
      'Explicit covenant conditions and framework terms mandated for the borrower',
    example: 'Maintain DSGIR below 40% continuously.',
  })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({
    description:
      'Comprehensive contextual narrative tracking the overall banking relationship health',
    example: 'Maintains healthy transactional savings accounts.',
  })
  @IsOptional()
  @IsString()
  bankingRelationshipRemarks?: string;

  @ApiPropertyOptional({
    description:
      'Core focal points identified for lowering transactional credit vulnerability indicators',
    example: 'Hypothecation of stock tracking metrics.',
  })
  @IsOptional()
  @IsString()
  keyCreditRiskMitigation?: string;

  @ApiPropertyOptional({
    description:
      'Structured executive case justification detailing utility backing credit request decisions',
    example: 'Funding supports local market demand increases.',
  })
  @IsOptional()
  @IsString()
  justificationOfLoan?: string;

  @ApiPropertyOptional({
    description:
      'The long-term account management monitoring approach blueprint',
    example: 'Quarterly review audits alongside continuous site monitoring.',
  })
  @IsOptional()
  @IsString()
  accountStrategy?: string;

  @ApiPropertyOptional({
    description:
      'Staged operational workflows handling credit disbursement releases safely',
    example:
      'Tranche 1 release upon verification of civil construction progress.',
  })
  @IsOptional()
  @IsString()
  disbursementSection?: string;

  @ApiPropertyOptional({
    description:
      'Explicit reporting documentation explaining intended utilization frameworks',
    example: 'Direct invoice clearing via bank settlement streams.',
  })
  @IsOptional()
  @IsString()
  utilizationOfFund?: string;

  @ApiPropertyOptional({
    description:
      'Conclusive summary and final recommendations package for signoff approval gates',
    example: 'Recommended for approval under proposed mitigation terms.',
  })
  @IsOptional()
  @IsString()
  conclusionAndRecommendation?: string;

  // =========================
  // 9. Approval Chain
  // =========================

  @ApiPropertyOptional({
    description:
      'Sequential Initiator -> Support -> Checker -> Approver sign-off chain for Step 9 of the assessment wizard.',
    type: () => ApprovalChainDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApprovalChainDto)
  approval?: ApprovalChainDto;
}
