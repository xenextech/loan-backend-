export enum CreditGrade {
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
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
