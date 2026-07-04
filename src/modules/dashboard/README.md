# Dashboard API — Frontend Integration Guide

Backend for the credit-ops "GenZ Loan Bank OS" admin screens: Dashboard,
Applications, Approval workflow, Disbursement, EMI schedule, Notifications, Document
center, Insurance tracker, Commission management, Audit ledger. Read it top to bottom
once, then use it as a per-screen reference after that.

## Before you write any code

Base URL & auth. Everything below is prefixed with `/api/v1` and needs an
`Authorization: Bearer <JWT>` header. Get the token from the existing
`POST /api/v1/auth/login`. Only staff accounts can call these routes: `ADMIN`,
`INITIATOR`, `SUPPORTER`, `CHECKER`, `APPROVER`. A student/parent/college token gets a
403.

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

One thing worth knowing before you wire anything up: there's no formal
approval-stage field on a loan application in this backend right now. No
`INITIATED / SUPPORTED / CHECKING / APPROVED` enum exists. Screens that imply a staged
pipeline (the funnel on Overview, the "stage" column on Applications) are approximated
from other fields and explicitly marked `"approximate": true` in the response. Don't
build UI logic assuming a real state machine sits behind this, it doesn't yet.

---

## 1. Dashboard Overview

The landing screen. Top-line numbers plus two feeds (checker queue, alerts).

| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard/overview` | Not paginated, one aggregate object |
| GET | `/dashboard/overview/checker-queue` | Paginated, applications awaiting approver sign-off |
| GET | `/dashboard/overview/alerts` | Paginated |

`GET /dashboard/overview` response:

```json
{
  "portfolioTotal": 1840000,
  "pendingMyActionCount": 5,
  "overdueEmi": { "count": 4, "amount": 74500 },
  "commissionThisMonth": { "total": 1800, "fromBanks": 1500, "fromColleges": 300 },
  "approvalPipeline": { "approximate": true, "initiated": 12, "supported": 9, "approved": 3 },
  "alerts": [
    { "type": "CICL_FLAG", "applicationId": "...", "message": "..." },
    { "type": "INSURANCE_EXPIRING", "applicationId": "...", "message": "..." },
    { "type": "EMI_OVERDUE", "applicationId": "...", "message": "..." }
  ]
}
```

Render the four stat tiles straight off this. `alerts` here is just a preview
(unpaginated); for a full scrollable list use `/overview/alerts` instead.

---

## 2. Applications List

The searchable table of all submitted applications.

| Method | Path |
|---|---|
| GET | `/dashboard/applications` |
| GET | `/dashboard/applications/:id` |

Query params: `page`, `limit`, `search` (matches name/ref no/citizenship no/phone),
`branch`, `dateFrom`, `dateTo`.

Row shape: `id, refNo, date, borrower, branch, type, amount, grade, stage, dsgir, ltv,
daysOpen`. `stage` is just the raw `DRAFT`/`SUBMITTED` status here, not a pipeline
stage, see the note above.

`GET /dashboard/applications/:id` gives the full record with nested study/loan info,
personal guarantee, insurance, and family members. Use it for the detail view.

---

## 3. Approval Workflow (read-only)

The per-application review screen a checker/approver looks at before signing off.

| Method | Path |
|---|---|
| GET | `/dashboard/approval/:applicationId/summary` |
| GET | `/dashboard/approval/:applicationId/credit-score` |
| GET | `/dashboard/approval/:applicationId/nrb-checklist` |
| GET | `/dashboard/approval/:applicationId/activity` (paginated) |

There's no forward/send-back/reject button to wire up here, none of that exists on
the backend yet. This screen is display-only. If the design calls for those actions,
that's a separate backend change to ask for, not something to fake client-side.

`nrb-checklist` returns an array of `{ label, tracked, value }`. `tracked: false`
means "no real data behind this yet", render it as a greyed-out/not-tracked row
rather than a failing checkbox. Don't read `value: null` as false.

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

Rough flow to build: load `pending` → click a row → load its `conditions` → let the
user tick them off through `PATCH` → once satisfied, show "confirm disbursement" →
`POST .../confirm`.

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
`PARTIAL` otherwise, the backend figures that out for you.

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

- No approval-stage workflow / forward-reject-send-back actions, see the note near
  the top.
- No PDF generation or e-signature for generated agreements.
- NRB lending cap is a hardcoded constant, not per-loan-type config.
- "HO visibility" toggle has no backend enforcement.
- `branch` is free text with no fixed list of valid branches. If the design wants a
  dropdown, that list needs to come from somewhere else, or be hardcoded on the
  frontend for now.
