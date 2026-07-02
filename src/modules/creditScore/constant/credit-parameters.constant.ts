export const CREDIT_PARAMETERS = {
  creditFacilitySize: [
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
  NA = 'NA',
}

export const LOW_RISK_THRESHOLD = 50;
export const MODERATE_RISK_THRESHOLD = 60;
export const MEDIUM_RISK_THRESHOLD = 70;
export const MEDIUM_HIGH_RISK_THRESHOLD = 80;
export const HIGH_RISK_THRESHOLD = 90;
export const VERY_HIGH_RISK_THRESHOLD = 95;
export const VERY_VERY_HIGH_RISK_THRESHOLD = 98;
export const EXTREMELY_HIGH_RISK_THRESHOLD = 100;

export enum RiskCategory {
  LOW = 'LOW_RISK',
  MODERATE = 'MODERATE_RISK',
  MEDIUM = 'MEDIUM_RISK',
  MEDIUM_HIGH = 'MEDIUM_HIGH_RISK',
  HIGH = 'HIGH_RISK',
  VERY_HIGH = 'VERY_HIGH_RISK',
  VERY_VERY_HIGH = 'VERY_VERY_HIGH_RISK',
  EXTREMELY_HIGH = 'EXTREMELY_HIGH_RISK',
}
