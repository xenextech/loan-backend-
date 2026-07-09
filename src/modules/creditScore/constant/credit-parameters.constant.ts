export const CREDIT_PARAMETERS = {
  creditLimit: [
    {
      max: 999999,
      weight: 2,
      point: 1,
    },
    {
      min: 1000000,
      max: 2500000,
      weight: 2,
      point: 2,
    },
    {
      min: 2500001,
      weight: 2,
      point: 3,
    },
  ],

  dsgir: [
    {
      max: 39.99,
      weight: 3,
      point: 1,
    },
    {
      min: 40,
      max: 45,
      weight: 3,
      point: 2,
    },
    {
      min: 45.01,
      weight: 3,
      point: 3,
    },
  ],

  operationOfInstitution: [
    {
      min: 10,
      weight: 2,
      point: 1,
    },
    {
      min: 5,
      max: 10,
      weight: 2,
      point: 2,
    },
    {
      max: 4.99,
      weight: 2,
      point: 3,
    },
  ],

  satisfactoryPerformance: [
    {
      min: 3,
      weight: 1,
      point: 1,
    },
    {
      min: 1,
      max: 3,
      weight: 1,
      point: 2,
    },
    {
      max: 0.99,
      weight: 1,
      point: 3,
    },
  ],

  parentsBorrowingsWithBFIs: [
    {
      value: 'US',
      weight: 1,
      point: 1,
    },
    {
      value: 'OTHER_BFI',
      weight: 1,
      point: 2,
    },
    {
      value: 'OTHER_BFIS',
      weight: 1,
      point: 3,
    },
  ],

  sourceOfIncome: [
    {
      value: 'FIXED',
      weight: 1,
      point: 1,
    },
    {
      value: 'SALARY_RENT_BUSINESS',
      weight: 1,
      point: 2,
    },
    {
      value: 'MIXED',
      weight: 1,
      point: 3,
    },
  ],
} as const;

export enum CreditGrade {
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  // Aggregate score >= MEDIUM_HIGH_RISK_THRESHOLD (80%) — mirrors the source
  // spreadsheet's blank D10/D11 cells for that range: deliberately left
  // ungraded rather than bucketed into a named grade, per the documented
  // scorecard design (see creditScore/ReadMe.md).
  NA = 'NA',
}

// Exact spreadsheet cutoffs (Risk Rating!D10: <0.51/<0.61/<0.71/<0.8), applied
// to the 0-100 percentage scale this service works in. Strict "<" — a
// percentage exactly equal to a threshold falls into the *next* band, not
// this one (e.g. 61% is A3, not A2).
export const LOW_RISK_THRESHOLD = 51;
export const MODERATE_RISK_THRESHOLD = 61;
export const MEDIUM_RISK_THRESHOLD = 71;
export const MEDIUM_HIGH_RISK_THRESHOLD = 80;

export enum RiskCategory {
  LOW = 'LOW_RISK',
  MODERATE = 'MODERATE_RISK',
  MEDIUM = 'MEDIUM_RISK',
  MEDIUM_HIGH = 'MEDIUM_HIGH_RISK',
  // Paired with CreditGrade.NA — aggregate score >= 80%, explicitly ungraded.
  UNGRADED = 'UNGRADED',
}
