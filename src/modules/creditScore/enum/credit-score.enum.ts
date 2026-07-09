// creditLimit/dsgir/operationOfInstitution/satisfactoryPerformance are scored
// off continuous numbers (see CREDIT_PARAMETERS' min/max rules), not a
// dropdown selection, so they have no categorical enum here — only the two
// genuinely categorical inputs do. Values match CREDIT_PARAMETERS' rule
// `value`s exactly; a caller sending anything else scores as "no data" (see
// CreditScoreService.getScore), so these are enforced via @IsEnum() on
// ScoreDto.
export enum ParentsBorrowingsWithBFIs {
  BORROWING_FROM_US = 'US',
  BORROWING_FROM_OTHER_BFI = 'OTHER_BFI',
  BORROWING_FROM_OTHER_BFIS = 'OTHER_BFIS',
}

export enum SourceOfIncome {
  FIXED = 'FIXED',
  SALARY_RENT_BUSINESS = 'SALARY_RENT_BUSINESS',
  MIXED = 'MIXED',
}
