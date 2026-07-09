// NOTE: This file is NOT imported by CreditScoreService.
// The live grade constants (thresholds, enums) are defined in
// credit-parameters.constant.ts, which is the single source of truth.
//
// This file previously contained stale / incorrect threshold values
// (50/60/70 instead of the correct 51/61/71 from the Risk Rating sheet)
// and extra grade categories (B-F with invented percentage thresholds)
// that are not part of the Pass Loan scorecard formula.
//
// All active exports have been removed to prevent accidental re-use.
// See credit-parameters.constant.ts for:
//   export enum CreditGrade { A1, A2, A3, A4, NA }
//   export enum RiskCategory { LOW, MODERATE, MEDIUM, MEDIUM_HIGH, UNGRADED }
//   export const LOW_RISK_THRESHOLD            = 51;
//   export const MODERATE_RISK_THRESHOLD       = 61;
//   export const MEDIUM_RISK_THRESHOLD         = 71;
//   export const MEDIUM_HIGH_RISK_THRESHOLD    = 80;
