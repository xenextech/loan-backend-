# Dashboard API — Frontend Integration Guide

Backend for the credit-ops "GenZ Loan Bank OS" admin screens: Dashboard,
Applications, Approval workflow, Disbursement, EMI schedule, Notifications, Document
center, Insurance tracker, Commission management, Audit ledger. Read it top to bottom
once, then use it as a per-screen reference after that.

## Before you write any code

Base URL & auth. Everything below is prefixed with `/api/v1` and needs an
`Authorization: Bearer <JWT>` header. Get the token from the existing
`POST /api/v1/auth/login`. Only staff accounts can call these routes: `ADMIN`,
`INITIATOR`, `SUPPORTER`, `CHECKER`, `CREDIT_MANAGER`, `APPROVER`. A student/parent/college
token gets a 403.

`CREDIT_MANAGER` is the current name for what used to be the `CHECKER` role — same
person, same job (the "checking" stage of the approval pipeline). `CHECKER` still
works on every endpoint that accepts `CREDIT_MANAGER` (existing JWTs/accounts aren't
broken), but new integrations should use `CREDIT_MANAGER`.

Every response is wrapped. Don't destructure the raw body directly, the actual
payload is one level down in `.data`:

```json
// success
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { "...": "the thing you asked for" },
  "timestamp": "2026-07-04T12:00:00.000Z"
}

// error
{
  "success": false,
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Application not found",
  "timestamp": "2026-07-04T12:00:00.000Z",
  "path": "/api/v1/dashboard/applications/xyz"
}
```

If you're writing a shared API client, unwrap `.data` in one place and throw on
`success: false` once, rather than repeating that per screen.

Every list endpoint paginates the same way. Query params `page` (default 1) and
`limit` (default 20, max 100). Response `.data` shape:

```json
{
  "data": [ "...rows" ],
  "meta": {
    "total": 132,
    "page": 1,
    "limit": 20,
    "totalPages": 7,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Swagger. Everything's also documented live at `/api/docs` with exact
request/response shapes and a try-it-out console. Use this doc to understand why and
in what order to call things; use Swagger for the exact field-by-field contract.

There is now a real approval-stage field on a loan application: `stage`, one of
`INITIATED / SUPPORTED / CHECKING / APPROVED / REJECTED / SENT_BACK` (`null` until the
bank workflow has actually started on it — a bare student-submitted application sits
at `stage: null` until someone supports it). The funnel on Overview and the "stage"
column on Applications now reflect this field directly, there's no more
`"approximate": true` flag. See §3 for the endpoints that move an application through
these stages.

Note `stage` is separate from `status` (`DRAFT`/`SUBMITTED`), which is unchanged and
still tracks the student-facing draft lifecycle — a bank-created application (via §2's
"create without ID" endpoint) can be walked all the way to `stage: APPROVED` while its
`status` stays `DRAFT`, since nothing currently promotes `status` for that path. This
matters for Disbursement (§4): `getPending` still filters on `status: SUBMITTED` in
addition to `approverDate`, so an approved bank-created application won't show up there
until that's addressed. Flagged as a known gap below, not fixed in this pass.

Another one: the mockup this was built from shows applications being entered by the
Initiator (branch/relationship officer, after a field visit), not by the borrower
self-service. This backend already has a separate `/applications` module for
student self-submission, which is a different flow from what the mockup depicts. Both
still exist, but the Initiator can now also start a brand new application without a
pre-existing ID (`POST /applications/initiator`, see §2) — so the mockup's flow is now
directly supported, it's just not the only path.

---

## 1. Dashboard Overview

The landing screen. Top-line numbers plus two feeds (checker queue, alerts).

| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard/overview` | Not paginated, one aggregate object |
| GET | `/dashboard/overview/checker-queue` | Paginated, applications at `stage: SUPPORTED` awaiting a Credit Manager's check |
| GET | `/dashboard/overview/alerts` | Paginated |

`GET /dashboard/overview` response:

```json
{
  "portfolioTotal": 1840000,
  "pendingMyActionCount": 5,
  "overdueEmi": { "count": 4, "amount": 74500 },
  "commissionThisMonth": { "total": 1800, "fromBanks": 1500, "fromColleges": 300 },
  "approvalPipeline": { "initiated": 12, "supported": 9, "checking": 4, "approved": 3 },
  "approvalStats": { "approved": 6, "rejected": 2, "totalDecided": 8, "approvalRate": 75, "avgProcessingTimeDays": 2.3 },
  "alerts": [
    { "type": "CICL_FLAG", "applicationId": "...", "message": "..." },
    { "type": "INSURANCE_EXPIRING", "applicationId": "...", "message": "..." },
    { "type": "EMI_OVERDUE", "applicationId": "...", "message": "..." }
  ]
}
```

Render the four stat tiles straight off this. `alerts` here is just a preview
(unpaginated); for a full scrollable list use `/overview/alerts` instead.
`approvalStats.approvalRate` is a percentage (0-100, one decimal), `null` if nothing
has been approved or rejected yet. `avgProcessingTimeDays` is the average
`approverDate - createdAt` across approved applications only, also `null` if none.

---

## 2. Applications List

The searchable table of all submitted applications.

| Method | Path | Notes |
|---|---|---|
| POST | `/applications/initiator` | INITIATOR-only, note this is *not* under `/dashboard`. Starts a brand new application, no pre-existing ID needed — see below |
| GET | `/dashboard/applications` | Supports `?filter=` — see below |
| GET | `/dashboard/applications/:id` | |
| GET | `/dashboard/applications/:id/detail` | Merged applicant view — see below |

Query params: `page`, `limit`, `search` (matches name/ref no/citizenship no/phone),
`branch`, `dateFrom`, `dateTo`, `filter`.

`filter` narrows the list by stage instead of the default `status: SUBMITTED`
restriction (so it also surfaces bank-created applications, which never get
`status: SUBMITTED` today — see the status/stage gap noted above): `my-queue`
(depends on your role — `SUPPORTER` sees `INITIATED`, `CREDIT_MANAGER`/`CHECKER` sees
`SUPPORTED`, `APPROVER` sees `CHECKING`), `pending` (`INITIATED`/`SUPPORTED`/
`CHECKING`), `approval` (`CHECKING`, i.e. awaiting the approver), `disbursement`
(`APPROVED`), `rejected`, `sent-back`.

Row shape: `id, refNo, date, borrower, branch, type, amount, grade, status, stage,
dsgir, ltv, daysOpen`. `status` is the raw `DRAFT`/`SUBMITTED` student-facing status;
`stage` is the real bank approval-pipeline stage (`INITIATED/SUPPORTED/CHECKING/
APPROVED/REJECTED/SENT_BACK`, or `null` before the bank workflow starts) — see the
note above on how the two relate. `dsgir` and `ltv` are values the Initiator typed
into the credit appraisal form, not something this API computes, there's no
income/existing-debt data anywhere in this system to derive DSGIR from. If a real
calculated DSGIR is needed, that's new scope (new input fields plus a formula), not a
bug in what exists.

`GET /dashboard/applications/:id` gives the full record with nested study/loan info,
personal guarantee, insurance, and family members. Use it for the detail view.

`GET /dashboard/applications/:id/detail` merges what otherwise takes 3+ separate calls
into one payload: `{ application, loanAccount, creditScore, activity }` — the full
record (including `loanAccount`), a live credit score breakdown, and the paginated
audit/activity trail, all in a single response. Prefer this over stitching together
`:id`, `/approval/:id/credit-score`, and `/approval/:id/activity` yourself.

`POST /applications/initiator` takes the same body as `CreateInitiatorApplicationDto`
and returns the created row with its server-generated `id` and `applicationNumber`.
Use that `id` for every subsequent `PATCH /applications/:applicationId/initiator` call
to fill in the rest of the credit appraisal form — same create-then-patch shape as the
student `/applications` flow. A freshly created application has `stage: null`; it
enters the pipeline once someone calls `support` on it (§3).

---

## 3. Approval Workflow

The per-application review screen a checker/approver looks at, plus the actions that
move an application through the pipeline.

Read-only:

| Method | Path |
|---|---|
| GET | `/dashboard/approval/:applicationId/summary` |
| GET | `/dashboard/approval/:applicationId/credit-score` |
| GET | `/dashboard/approval/:applicationId/nrb-checklist` |
| GET | `/dashboard/approval/:applicationId/activity` (paginated) |

Stage transitions — each stamps the relevant sign-off fields (name/post/date/
signature aren't auto-filled from the JWT today except the date; post/signature still
need a follow-up PATCH if the UI collects them), writes an audit log entry, and
400s if the application isn't at a valid predecessor stage for that action:

| Method | Path | Role(s) | Effect |
|---|---|---|---|
| POST | `/dashboard/approval/:applicationId/support` | `SUPPORTER` | stage → `SUPPORTED` (valid from `null`/`INITIATED`/`SENT_BACK`) |
| POST | `/dashboard/approval/:applicationId/check` | `CREDIT_MANAGER` (or `CHECKER`) | stage → `CHECKING` (valid from `SUPPORTED`/`SENT_BACK`) |
| POST | `/dashboard/approval/:applicationId/approve` | `APPROVER` | stage → `APPROVED` (valid from `CHECKING` only). Sets `approverDate` and auto-creates the `LoanAccount` credit ledger (see §4) |
| POST | `/dashboard/approval/:applicationId/reject` | `CREDIT_MANAGER`/`CHECKER`/`APPROVER` | stage → `REJECTED` from any stage. Body: `{ reason }`. Now also notifies the applicant (email + SMS if a phone number is on file) |
| POST | `/dashboard/approval/:applicationId/send-back` | `SUPPORTER`/`CREDIT_MANAGER`/`CHECKER`/`APPROVER` | stage → `SENT_BACK` from any stage. Body: `{ reason, toStage? }` (`toStage` defaults to `INITIATED`) — re-entering the pipeline (e.g. calling `support` again) is allowed from `SENT_BACK` |
| POST | `/dashboard/approval/:applicationId/pep-screening` | `CREDIT_MANAGER`/`CHECKER` | Records the applicant's PEP (Politically Exposed Person) check. Body: `{ status: boolean, remarks? }` — `status: true` means the applicant *is* a PEP |

These endpoints are new and manually verified end-to-end (create → support → check →
approve, and separately reject / send-back-then-resupport / pep-screening), but don't
have dedicated `*.spec.ts` unit tests yet — `dashboard-approval.service.spec.ts` only
covers the original read-only methods. Worth adding before this ships to production.

`nrb-checklist` returns an array of `{ label, tracked, value }`. `tracked: false`
means "no real data behind this yet", render it as a greyed-out/not-tracked row
rather than a failing checkbox. Don't read `value: null` as false. `PEP screening` is
now tracked once `pep-screening` has been called for that application.

`activity` is just the audit log filtered to this application, use it for the
activity trail.

---

## 4. Disbursement

The disbursement queue, per-application conditions checklist, and confirming a
tranche payout.

| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard/disbursement/pending` | Paginated, approved apps not yet fully disbursed |
| GET | `/dashboard/disbursement/:applicationId/conditions` | |
| POST | `/dashboard/disbursement/:applicationId/conditions` | Body: `{ label }` |
| PATCH | `/dashboard/disbursement/:applicationId/conditions/:conditionId` | Body: `{ status: "PENDING"\|"DONE"\|"MISSING", remarks? }` |
| POST | `/dashboard/disbursement/:applicationId/confirm` | see below |
| GET | `/dashboard/disbursement/history` | Paginated tranche history |

`confirm` body: `{ trancheNumber, amount, accountCredited?, commissionAmount?, date? }`.
It's additive, call it once per tranche disbursed rather than sending the whole
history each time. It creates the tranche record, and the parent disbursement record
too if this is the first tranche for that application.

**Bank account gate**: `confirm` now 400s with `"Parent bank account not set up —
cannot disburse"` unless the application's `ParentVerification.bankAccountNumber` is
filled in (the per-application parent submission, not the account-level
`ParentProfile`). `pending` rows include a `bankAccountReady: boolean` flag so the UI
can show which applications are actually disbursable vs. still blocked on that step.

**Credit ledger**: approving an application (§3) auto-creates a `LoanAccount` —
`{ id, applicationId, loanAccountNumber, status: "ACTIVE"|"CLEARED" }`. It's the
master record tying approval → disbursement → EMI schedule together; it doesn't
duplicate principal/rate/tenure (read those off the application) or disbursed-to-date
(read off `Disbursement.totalDisbursedAmount`). `status` flips to `CLEARED`
automatically once every EMI schedule entry for that application is `PAID` (§5). See
it embedded in `GET /dashboard/applications/:id/detail` (§2).

Rough flow to build: load `pending` → click a row → check `bankAccountReady` → load
its `conditions` → let the user tick them off through `PATCH` → once satisfied, show
"confirm disbursement" → `POST .../confirm`.

---

## 5. EMI Schedule / Repayment

Viewing/generating a loan's amortization schedule and tracking overdue collections.

| Method | Path | Notes |
|---|---|---|
| POST | `/dashboard/repayment/:applicationId/generate-schedule` | Idempotent, safe to call again, replaces the schedule |
| GET | `/dashboard/repayment/:applicationId/schedule` | Paginated |
| GET | `/dashboard/repayment/overdue?bucket=1-30\|31-90\|90+` | Paginated, `bucket` optional |
| GET | `/dashboard/repayment/overview` | Not paginated, the stat tiles |
| PATCH | `/dashboard/repayment/schedule/:entryId/mark-paid` | Body: `{ paidAmount, paidDate }` |
| GET | `/dashboard/repayment/notification-triggers` | Static config list, no params |

Sequencing matters here: a schedule only exists after `generate-schedule` gets
called, which is expected to happen once a disbursement is confirmed (screen 4), not
automatically. Call `GET .../schedule` before that and you just get an empty
paginated list, not an error.

`mark-paid` sets the entry to `PAID` if `paidAmount` covers the full EMI, or
`PARTIAL` otherwise, the backend figures that out for you. Once every entry for an
application is `PAID`, its `LoanAccount.status` (§4) automatically flips from
`ACTIVE` to `CLEARED` — no separate "close the loan" call needed.

**Daily cron job** (new): a scheduled job runs once a day and (1) bulk-transitions any
due `EmiScheduleEntry` past its due date from `UPCOMING`/`PARTIAL` to `OVERDUE`, (2)
sends SMS + WhatsApp reminders to borrowers per the trigger schedule below
(pre-due reminders and overdue escalations), and (3) notifies every `CREDIT_MANAGER`/
`CHECKER` user (as an in-app `Notification`) whenever entries newly become overdue.
This isn't a dashboard endpoint you call — it's fully automatic — but it's the thing
that finally makes `notification-triggers` below a real schedule instead of just
reference copy.

`notification-triggers` rows now also carry an `offsetDays` (negative = days before
due, positive = days overdue) that the cron job uses to match entries — e.g. `{
trigger: '7 days', offsetDays: -7 }` fires when an entry is due in exactly 7 days.
The one exception is `Doc expiry`, which has no `offsetDays` (it isn't tied to an EMI
due date) and is display-only.

**SMS/WhatsApp delivery**: wired to Twilio (`sendSms`/`sendWhatsapp` on
`NotificationsService`). Requires `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/
`TWILIO_PHONE_NUMBER`/`TWILIO_WHATSAPP_NUMBER` in `.env` — without real credentials,
sends are skipped with a logged warning rather than failing the request (so the app
runs fine without Twilio configured, it just doesn't deliver).

The amortization math (standard reducing-balance EMI formula) has been checked
against the mockup's own worked example, Rs 7.1L at 9.10% over 96 months, and the
generated schedule matches the mockup's EMI/principal/interest/balance columns to
within a rupee or two per row (the mockup rounds the EMI to a whole rupee before
building its table, this API keeps two decimal places throughout, that's the only
source of the small difference).

---

## 6. Notifications

The notification log viewer plus message template CRUD.

| Method | Path |
|---|---|
| GET | `/dashboard/notifications/log` |
| GET | `/dashboard/notifications/templates` |
| POST | `/dashboard/notifications/templates` |
| PATCH | `/dashboard/notifications/templates/:id` |
| DELETE | `/dashboard/notifications/templates/:id` |

`log` filters: `channel` (`APP`/`EMAIL`/`SMS`/`WHATSAPP`), `deliveryStatus`
(`SENT`/`DELIVERED`/`READ`/`FAILED`), `applicationId`, `dateFrom`/`dateTo`.

Template body: `{ name, channel, subject?, body, isActive? }`. `body` is free text
with `{placeholders}` like `{name}`/`{amount}`/`{date}`, so a plain textarea is fine,
no templating engine needed on the frontend.

---

## 7. Document Center

Verifying a borrower's offer letter, browsing the document vault, generating loan
agreements.

| Method | Path | Notes |
|---|---|---|
| POST | `/dashboard/documents/offer-letter/verify` | Body: `{ applicationId, refOrQrToken }` |
| GET | `/dashboard/documents/vault` | Paginated, filters `applicationId`/`documentType` |
| GET | `/dashboard/documents/agreements` | Paginated |
| POST | `/dashboard/documents/agreements` | Body: `{ applicationId, agreementType }` |
| POST | `/dashboard/documents/agreements/:id/send-to-sign` | |
| PATCH | `/dashboard/documents/agreements/:id/mark-signed` | |

`verify` returns `{ matched: boolean, offerLetter, verification }`. `matched: false`
just means nothing matched that ref/QR, show a "not found" state rather than an
error toast, it's a 200 not a 4xx.

Agreements don't have a PDF yet. `documentUrl` on a generated agreement is always
`null` right now, there's no PDF rendering pipeline behind this. The lifecycle is
`DRAFT → PENDING_SIGNATURE → SIGNED/ACTIVE`, tracked as plain status fields. If the
design shows a view/download PDF button, it's not backed by anything, flag it rather
than wiring it to a dead link.

---

## 8. Insurance Tracker

Tracking insurance policies attached to loans and their expiry.

| Method | Path |
|---|---|
| GET | `/dashboard/insurance/stats` |
| GET | `/dashboard/insurance/policies` |
| POST | `/dashboard/insurance/policies` |
| GET | `/dashboard/insurance/policies/:id` |

Every policy in a list/detail response has a computed `status`: `ACTIVE` /
`EXPIRING_SOON` (within 30 days) / `EXPIRED`. It's computed fresh on every request
from `expiryDate`, not stored, so it's always current but you can't filter by it
server-side (only `applicationId` today).

`create` body: `{ applicationId, policyNumber, insurer, policyType?, sumInsured,
premiumAmount?, startDate?, expiryDate }`.

---

## 9. Commission Management

Tracking bank/college MOU commission rates and the resulting earnings ledger.

| Method | Path |
|---|---|
| GET | `/dashboard/commission/summary` |
| GET | `/dashboard/commission/by-bank` |
| GET | `/dashboard/commission/by-college` |
| GET | `/dashboard/commission/nrb-cap-compliance` |
| GET/POST | `/dashboard/commission/partners` |
| PATCH | `/dashboard/commission/partners/:id` |
| GET/POST | `/dashboard/commission/entries` |
| PATCH | `/dashboard/commission/entries/:id` |

A `CommissionPartner` (a bank or college MOU record) has to exist before you can log
a `CommissionEntry` against it, `partners` is reference data, `entries` is the
ledger. Build the partners CRUD first, everything else here depends on it.

The NRB cap is currently hardcoded to NPR 10,00,000 (Rs 10L) as a placeholder for the
real regulatory figure, `nrb-cap-compliance` just compares every borrower's
`creditLimit` against that fixed number. If the real figure changes it's a backend
config change, nothing to duplicate on the frontend.

`by-bank`/`by-college` rows include a `loans` count, that's distinct applications
with at least one commission entry against that partner, not raw entry count.

---

## 10. Audit Ledger

The immutable activity log with category tabs and CSV export.

| Method | Path |
|---|---|
| GET | `/dashboard/audit` |
| POST | `/dashboard/audit/manual-entry` |
| GET | `/dashboard/audit/export/csv` |

`GET /dashboard/audit` filters: `category` (`APPROVAL`/`DISBURSEMENT`/`REPAYMENT`/
`COMMISSION`/`SYSTEM`), `userId`, `applicationId`, `dateFrom`/`dateTo`. Map the
mockup's tabs (All/Approvals/Disbursements/Repayments/Commission/System changes)
straight onto `category`, "All" just means omit the param.

`export/csv` returns a raw CSV file (`Content-Type: text/csv`), not JSON, trigger it
as a file download rather than trying to parse it.

The "HO visibility" toggle from the mockup is UI-only, there's no backend field or
access rule behind it. Don't wire it to a real filter, if it needs to actually
restrict visibility that's a backend feature to ask for first.

---

## Known gaps

Don't quietly build around these, flag them if the design needs them:

- `status` (`DRAFT`/`SUBMITTED`) and `stage` (`INITIATED`.../`APPROVED`) are separate
  fields and nothing currently promotes a bank-created application's `status` to
  `SUBMITTED`. An initiator-created application can reach `stage: APPROVED` while
  still `status: DRAFT`, which means it still won't show up in Disbursement's
  `getPending` (that query filters on both `status: SUBMITTED` and
  `approverDate: not null`) even though the bank-account gate and `LoanAccount`
  creation both work correctly for it. Needs a decision on whether `status` should
  just be retired in favor of `stage`, or promoted automatically on `support`/some
  other point. This is now the single biggest remaining gap.
- None of the newer endpoints (§3's stage transitions and `pep-screening`, §2's
  `filter`/`:id/detail`, §4's bank-account gate, §5's cron job) have automated unit
  tests yet — all verified manually end-to-end against a live dev database. Add
  `*.spec.ts` coverage before relying on this in production.
- Twilio SMS/WhatsApp code is wired up but untested against real delivery — no
  `TWILIO_*` credentials have been supplied yet. Sends currently no-op with a logged
  warning.
- No PDF generation or e-signature for generated agreements.
- NRB lending cap is a hardcoded constant, not per-loan-type config.
- "HO visibility" toggle has no backend enforcement.
- `branch` is free text with no fixed list of valid branches. If the design wants a
  dropdown, that list needs to come from somewhere else, or be hardcoded on the
  frontend for now.
- No "grace period" field exists on a loan application — interest rate, tenure, and
  amount are all configurable, but a grace-period concept (mentioned in the bank's own
  process flowchart) would be new scope.
- Blacklist (`isBlacklisted`) is still just a manually-set boolean with no dedicated
  check step or audit trail, unlike PEP screening (§3) which now has both.
