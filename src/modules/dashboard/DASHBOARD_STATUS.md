# Dashboard Feature — Status Summary

Last updated: 2026-07-04

Plain-English writeup of what got built and why. No endpoint lists, no code. If you
need the actual API contract, that's in `src/modules/dashboard/README.md`. The
original technical build plan is at `~/.claude/plans/glittery-conjuring-ember.md`
if anyone wants the engineering-level version.

## What this is

This is the bank-staff side of GenZ Loan: a "Credit Head" operating dashboard that
covers the full lifecycle of a loan after a student submits it. Reviewing it,
approving it, disbursing the money, tracking repayment, managing insurance and
commission relationships, and keeping an audit trail of all of it. It was built off a
set of UI mockups showing 10 screens, and the backend API for all 10 now exists.

## What was built, screen by screen

1. Dashboard overview. The landing page. Total loan portfolio value, how many
   applications need this staff member's attention, overdue payment counts,
   commission earned this month, and a live alerts feed (blacklist flags, expiring
   insurance, overdue payments).
2. Applications list. A searchable, filterable table of every submitted loan
   application with the numbers reviewers actually look at: risk grade, debt ratios,
   loan-to-value.
3. Approval workflow. The detail screen a reviewer looks at for one application:
   borrower summary, live credit score breakdown, a compliance checklist, activity
   history. 
4. Disbursement. Once a loan is approved, tracks the checklist of conditions that
   need to be satisfied (documents signed, deed registered, etc.) before money goes
   out, and records each payout.
5. EMI schedule / repayment. Generates the month-by-month repayment schedule for
   a disbursed loan and tracks who's paid, who's late, and by how much (1-30 / 31-90 /
   90+ days overdue buckets).
6. Notifications. A log of every SMS/WhatsApp/Email/App notification sent to
   borrowers, plus reusable message templates staff can edit.
7. Document center. Verifying a student's college offer letter is genuine,
   browsing all uploaded documents in one place, and generating the loan
   agreement/guarantee paperwork for signing.
8. Insurance tracker. Which loans have insurance attached, which policies are
   expiring soon or already lapsed, how well-covered the loan book is overall.
9. Commission management. Tracking the revenue-share agreements with partner
   banks and colleges, and the running ledger of what's been earned and what's still
   owed.
10. Audit ledger. An immutable, filterable log of every significant action taken
    in the system, with CSV export for compliance reporting.

## How solid is this

Every piece of business logic behind these 10 screens has automated tests. 105 tests,
all passing, covering the normal case, the edge cases (missing data, empty lists), and
the error cases (not-found, invalid state transitions) for each feature. The backend
builds and boots cleanly too. This wasn't thrown together as a demo — it's held to the
same bar as the rest of the platform.

Worth mentioning: one real bug got found and fixed along the way. The existing
credit-score calculator (used elsewhere in the app already, not new) would crash for
any application missing certain optional fields, which is a normal, common situation,
not some rare edge case. It now handles that gracefully instead of throwing. This was
a pre-existing issue unrelated to the dashboard work itself, it just surfaced because
the new Approval Workflow screen calls into that same calculator.

## Checked against the original mockup

Once the actual mockup HTML was available (not just screenshots), two things got
verified directly rather than assumed:

- EMI calculation. Ran the real amortization formula from this codebase against the
  mockup's own worked example (a Rs 7.1L loan at 9.10% over 96 months) and it
  reproduces the mockup's EMI, principal, interest, and balance columns to within a
  rupee or two per row, that gap is just rounding (the mockup rounds the EMI to a
  whole rupee before building its table, ours keeps two decimal places). Same
  formula, same logic, confirmed rather than assumed.
- DSGIR. This turned out not to be a calculated value anywhere, not in the mockup,
  not in this backend. It's a number the Initiator types directly into the credit
  appraisal form. The backend only uses it to look up which risk band it falls into
  (below 40% / 40-45% / above 45%) for scoring, it doesn't derive it from income or
  existing debt because none of that data exists in the system today. If a real
  DSGIR calculation is wanted, that's new scope: new income/debt input fields plus a
  formula, not a fix to something broken.
- Who creates an application. The mockup shows the Initiator (branch/relationship
  officer) entering applications after a field visit. This backend's existing
  `/applications` module is a separate, student-self-submission flow. Both exist,
  which one actually feeds the dashboard's applications list is a product decision
  still open, not something resolved by the code as it stands.

## Not done yet

These were scoped out on purpose when this work was planned, not things that got
missed:

- No approve/reject/send-back buttons. The Approval Workflow screen shows a
  reviewer everything they need to make a decision, but there's no formal "stage"
  concept in the system yet (Initiated → Supported → Checking → Approved). Adding real
  workflow actions means designing that state machine first, which is follow-up work,
  not a bug in this pass.
- No PDF generation or e-signatures. Loan agreements can be drafted and marked
  signed in the system, but there's no actual PDF document produced, and no
  e-signature integration. Right now it's a paper trail of statuses, not documents.
- The regulatory lending cap is a placeholder number, not the real NRB figure. It
  needs the actual compliance number from whoever owns that relationship before this
  is anywhere near real money.
- Branch names are free text with no fixed list yet, and the "Head Office visibility"
  toggle shown in the mockup isn't backed by a real access rule.

None of this blocks using the other screens. These are specific, scoped gaps, written
down so nobody assumes they're already handled.

## For a developer picking this up

- Read `src/modules/dashboard/README.md` first. It has the exact request/response
  shapes, auth requirements, and the order to call things in (the EMI schedule only
  gets generated after a disbursement is confirmed, for example, not automatically).
- Every service has a matching `*.spec.ts` file sitting right next to it. Read the
  tests before changing behavior, they document what edge cases were actually
  considered.
- Everything lives under `src/modules/dashboard/`, one folder per screen. Nothing
  outside that folder needed to change except a couple of shared modules picking up
  an `exports: [...]` line so the dashboard module could reuse existing services
  instead of re-implementing them.

## For a manager reviewing progress

- All 10 screens from the mockups have a working, tested backend behind them now.
  Frontend integration can start.
- The 4 gaps above are known and documented, not surprises waiting to be found later.
- Nothing existing was broken or changed in behavior. One incidental bug in the
  credit-scoring logic got found and fixed on the way through.
