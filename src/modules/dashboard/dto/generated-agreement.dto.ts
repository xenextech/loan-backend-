import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GeneratedAgreementType } from '../../../common/enums';

export class CreateGeneratedAgreementDto {
  @ApiProperty()
  @IsString()
  applicationId!: string;

  @ApiProperty({ enum: GeneratedAgreementType })
  @IsEnum(GeneratedAgreementType)
  agreementType!: GeneratedAgreementType;

  @ApiPropertyOptional({
    description:
      'Additional clauses, conditions, or remarks to include in the document. Everything else (borrower/loan/EMI details) is auto-populated from the application — do not resubmit stored data.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description:
      'Name of the financial institution (bank/NBFC) this document is issued on behalf of. The platform generates documents for multiple partner institutions, not just Unnati — defaults to "Unnati" if omitted.',
  })
  @IsOptional()
  @IsString()
  institutionName?: string;

  // The following have no source elsewhere in the application data — they
  // are blanks ("...................") on the paper Loan Agreement that the
  // Credit Manager fills in by hand before generating. All optional; left
  // as dotted blanks in the rendered document when omitted.

  @ApiPropertyOptional({ description: "Borrower's permanent address." })
  @IsOptional()
  @IsString()
  studentAddress?: string;

  @ApiPropertyOptional({ description: "Borrower's citizenship certificate number." })
  @IsOptional()
  @IsString()
  studentCitizenshipNo?: string;

  @ApiPropertyOptional({ description: "District Administration Office that issued the borrower's citizenship certificate." })
  @IsOptional()
  @IsString()
  studentCitizenshipOffice?: string;

  @ApiPropertyOptional({ description: 'Name of the branch manager co-signing on behalf of the institution.' })
  @IsOptional()
  @IsString()
  branchManagerName?: string;

  @ApiPropertyOptional({ description: "Guarantor's name — overrides the application's stored guarantor name if provided." })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional({ description: "Guarantor's relationship to the borrower — overrides the application's stored value if provided." })
  @IsOptional()
  @IsString()
  guarantorRelationship?: string;

  @ApiPropertyOptional({ description: "Guarantor's citizenship certificate number." })
  @IsOptional()
  @IsString()
  guarantorCitizenshipNo?: string;

  @ApiPropertyOptional({ description: "Guarantor's citizenship certificate issue date." })
  @IsOptional()
  @IsString()
  guarantorCitizenshipIssueDate?: string;

  @ApiPropertyOptional({ description: "District Administration Office that issued the guarantor's citizenship certificate." })
  @IsOptional()
  @IsString()
  guarantorCitizenshipOffice?: string;

  @ApiPropertyOptional({ description: "Guarantor's address." })
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  // The following are only rendered by GUARANTEE_DEED / PROMISSORY_NOTE,
  // which (unlike LOAN_AGREEMENT) follow the traditional Nepali citizenship
  // parentage/permanent-address format on the paper original.

  @ApiPropertyOptional({ description: "Borrower's citizenship certificate issue date." })
  @IsOptional()
  @IsString()
  studentCitizenshipIssueDate?: string;

  @ApiPropertyOptional({ description: "Borrower's father's or husband's name." })
  @IsOptional()
  @IsString()
  studentFatherOrHusbandName?: string;

  @ApiPropertyOptional({ description: "Borrower's grandfather's name." })
  @IsOptional()
  @IsString()
  studentGrandfatherName?: string;

  @ApiPropertyOptional({ description: "Borrower's permanent address — district." })
  @IsOptional()
  @IsString()
  studentPermanentDistrict?: string;

  @ApiPropertyOptional({ description: "Borrower's permanent address — municipality/rural municipality." })
  @IsOptional()
  @IsString()
  studentPermanentMunicipality?: string;

  @ApiPropertyOptional({ description: "Borrower's permanent address — ward number." })
  @IsOptional()
  @IsString()
  studentPermanentWardNo?: string;

  @ApiPropertyOptional({ description: "Guarantor's father's or husband's name." })
  @IsOptional()
  @IsString()
  guarantorFatherOrHusbandName?: string;

  @ApiPropertyOptional({ description: "Guarantor's grandfather's name." })
  @IsOptional()
  @IsString()
  guarantorGrandfatherName?: string;

  @ApiPropertyOptional({ description: "Guarantor's permanent address — district." })
  @IsOptional()
  @IsString()
  guarantorPermanentDistrict?: string;

  @ApiPropertyOptional({ description: "Guarantor's permanent address — municipality/rural municipality." })
  @IsOptional()
  @IsString()
  guarantorPermanentMunicipality?: string;

  @ApiPropertyOptional({ description: "Guarantor's permanent address — ward number." })
  @IsOptional()
  @IsString()
  guarantorPermanentWardNo?: string;

  @ApiPropertyOptional({ description: "Guarantor's age (years)." })
  @IsOptional()
  @IsString()
  guarantorAge?: string;

  // PROMISSORY_NOTE only — collateral/mortgage security details (धितो
  // सुरक्षणको विवरण table).

  @ApiPropertyOptional({ description: "Collateral: registered owner's name." })
  @IsOptional()
  @IsString()
  collateralOwnerName?: string;

  @ApiPropertyOptional({ description: "Collateral: property address." })
  @IsOptional()
  @IsString()
  collateralAddress?: string;

  @ApiPropertyOptional({ description: "Collateral: plot/kitta number." })
  @IsOptional()
  @IsString()
  collateralPlotNo?: string;

  @ApiPropertyOptional({ description: "Collateral: area." })
  @IsOptional()
  @IsString()
  collateralArea?: string;

  @ApiPropertyOptional({ description: "Collateral: remarks." })
  @IsOptional()
  @IsString()
  collateralRemarks?: string;

  // HYPOTHECATION only — कर्जा रकम निकासा अनुरोध पत्र specific fields.

  @ApiPropertyOptional({ description: 'Date the loan approval/sanction letter was issued.' })
  @IsOptional()
  @IsString()
  approvalLetterDate?: string;

  @ApiPropertyOptional({ description: 'Loan tenure expiry date.' })
  @IsOptional()
  @IsString()
  loanExpiryDate?: string;

  @ApiPropertyOptional({ description: "Borrower's designation/position signing the request (e.g. Student)." })
  @IsOptional()
  @IsString()
  borrowerPosition?: string;

  @ApiPropertyOptional({ description: 'Disbursement bank account holder name.' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ description: 'Disbursement bank account number.' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;
}

export class GeneratedAgreementQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;
}
