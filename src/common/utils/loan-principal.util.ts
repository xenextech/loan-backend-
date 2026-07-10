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
