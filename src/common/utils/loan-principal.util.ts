import type { RepaymentFrequency } from '@prisma/client';

// Single source of truth for "what principal is actually being disbursed /
// repaid" for an application. The Credit Manager's finalPrincipalAmount
// override (set via DashboardRepaymentService.configureServicing) takes
// precedence, then the actual confirmed Disbursement total, then the
// Approver-approved credit limit, and finally the originally requested loan
// amount for applications that predate any of the above. Shared by EMI
// schedule generation and read-only loan detail views so every module
// surfaces the same authoritative figure once an override is made.
// Params accept `unknown` (mirroring the built-in `Number()` signature)
// since Prisma returns monetary columns as Decimal.js instances, not plain
// numbers or strings.
export function resolveFinalPrincipalAmount(params: {
  finalPrincipalAmount?: unknown;
  totalDisbursedAmount?: unknown;
  creditLimit?: unknown;
  loanAmount?: unknown;
}): number {
  return Number(
    params.finalPrincipalAmount ??
      params.totalDisbursedAmount ??
      params.creditLimit ??
      params.loanAmount ??
      0,
  );
}

// Loan tenure in months — the Credit Manager's finalTenureMonths override if
// set, else the originally requested period converted to months (period is
// stored in either MONTH or YEAR units on the application).
export function resolveEffectiveTenureMonths(params: {
  finalTenureMonths?: number | null;
  period?: number | null;
  periodUnit?: 'YEAR' | 'MONTH' | null;
}): number {
  return (
    params.finalTenureMonths ??
    (params.periodUnit === 'YEAR'
      ? (params.period ?? 0) * 12
      : (params.period ?? 0))
  );
}

export interface EffectiveLoanTerms {
  principal: number;
  interestRate: number;
  tenureMonths: number;
  gracePeriodMonths: number;
  repaymentFrequency: RepaymentFrequency;
  interestFrequency: RepaymentFrequency;
}

// The full set of servicing terms a schedule is amortized from, resolved
// with the same Credit-Manager-override-first precedence as
// resolveFinalPrincipalAmount/resolveEffectiveTenureMonths above. Used by
// DashboardRepaymentService.generateSchedule() to build the schedule, and by
// ApplicationTrackerService to describe those same terms to the student
// without re-deriving them.
export function resolveEffectiveLoanTerms(params: {
  finalPrincipalAmount?: unknown;
  totalDisbursedAmount?: unknown;
  creditLimit?: unknown;
  loanAmount?: unknown;
  finalInterestRate?: unknown;
  interestRate?: unknown;
  finalTenureMonths?: number | null;
  period?: number | null;
  periodUnit?: 'YEAR' | 'MONTH' | null;
  gracePeriodMonths?: number | null;
  repaymentFrequency?: RepaymentFrequency | null;
  interestFrequency?: RepaymentFrequency | null;
}): EffectiveLoanTerms {
  const repaymentFrequency = params.repaymentFrequency ?? 'MONTHLY';
  return {
    principal: resolveFinalPrincipalAmount(params),
    interestRate: Number(params.finalInterestRate ?? params.interestRate ?? 0),
    tenureMonths: resolveEffectiveTenureMonths(params),
    gracePeriodMonths: params.gracePeriodMonths ?? 0,
    repaymentFrequency,
    interestFrequency: params.interestFrequency ?? repaymentFrequency,
  };
}
