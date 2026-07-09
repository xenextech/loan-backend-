Credit Scoring API

NestJS + Prisma + PostgreSQL implementation of the Home Loan Risk Rating scorecard from Book1 (2).xlsx ("Best Finance Company Limited"). The scoring engine reproduces the workbook's formula chain cell-for-cell — see src/scoring-engine/scoring-engine.service.ts for the line-by-line mapping.

The exact formula being replicated

Risk Rating!D14:D19  =IFS(B=WC!L, WC!O, B=WC!M, WC!P, TRUE, WC!Q)      point (1-3) per parameter
Risk Rating!E14:E19  =C*D                                              weighted score = weight x point
Risk Rating!E20      =SUM(E14:E19)                                     total risk score
Risk Rating!D9       =E20/30                                           aggregate score (30 = sum(weights) x 3)
Risk Rating!D10      =IF(D9<0.51,"A1",IF(D9<0.61,"A2",IF(D9<0.71,"A3",IF(D9<0.8,"A4",""))))   risk grade
Risk Rating!D11      =INDEX('Risk Grade'!C4:C12, MATCH(D10,'Risk Grade'!D4:D12,0))            risk definition

Verified numerically against the workbook's own cached values (weights 2,3,2,1,1,1, points 1,1,1,1,2,1):

ExcelAPITotal Risk Score1111Aggregate Score0.366666... (36.67%)0.366666...Risk GradeA1A1Risk DefinitionLow RiskLow Risk

Run node scripts/verify-formula.js (plain Node, no install required) to reproduce this check yourself — see Formula verification below.

Two deliberate, requested deviations from the raw spreadsheet


aggregateScore denominator is computed dynamically (sum(weight_i * max points in parameter_i)) instead of the hard-coded literal 30 in the workbook. For the seeded Home Loan template this evaluates to exactly 30 — identical output — but it no longer silently breaks if a weight changes later (see the analysis report, §10.1, for why the hard-coded 30/WC!K8 constants are a real defect in the source file).
aggregateScore >= 0.80 is explicitly ungraded (riskGrade: null), exactly matching Excel's blank D10/D11 result for that range, per your instruction to replicate the formula exactly rather than inventing a new band.
Missing or invalid answers are rejected with a 400, instead of Excel's IFS(...,TRUE,worstCasePoint) catch-all, which silently scores a blank/unmatched dropdown as maximum risk (point 3). This was flagged as a data-integrity risk in the analysis report; the API surfaces it as an explicit validation error instead of masking it.


All other arithmetic — point lookup, weighting, summation, normalization, grade thresholds — is reproduced exactly.

Data model

Rather than hard-coding the six Home Loan parameters into the code, the catalogue is database-driven and versioned (ScorecardTemplate → ScorecardParameter → ParameterOption, and GradeDefinition for the Risk Grade sheet), so the same engine can score other loan products later without code changes. See prisma/schema.prisma for the full model and prisma/seed.ts for the exact values transcribed from the WC and Risk Grade sheets.

LoanProduct 1--* ScorecardTemplate 1--* ScorecardParameter 1--* ParameterOption
                              \--* GradeDefinition
                              \--* RiskAssessment 1--* AssessmentAnswer

Setup


This project was authored and formula-checked in a sandboxed environment without npm registry access, so dependencies could not be installed or tsc/nest build run here. All package versions are pinned to a known-compatible NestJS 10 / Prisma 5 stack; run the steps below in your own environment.



bashcd credit-scoring-api
npm install

cp .env.example .env
# edit .env with your PostgreSQL connection string

npx prisma migrate dev --name init   # creates tables
npm run prisma:seed                  # loads the exact Home Loan template from Book1 (2).xlsx

npm run start:dev                    # http://localhost:3000

Run the unit tests (formula correctness, edge cases, error handling):

bashnpm test

Formula verification

A dependency-free check that needs nothing but Node:

bashnode scripts/verify-formula.js

API

MethodEndpointPurposePOST/loan-productsCreate a loan productGET/loan-productsList loan productsGET/loan-products/:id/scorecard-templates/activeFetch the active template (parameters, options, grade bands) for scoringPOST/scorecard-templatesCreate a new versioned template (e.g. a different loan product)GET/scorecard-templates/:idFetch a specific template versionPOST/risk-assessments/previewRun the exact formula and return the result without persistingPOST/risk-assessmentsCreate + compute + persist a borrower risk assessmentGET/risk-assessments/:idFetch a computed assessment with full per-parameter breakdownGET/risk-assessments?templateId=...List assessments

Example walkthrough

bash# 1. Fetch the seeded Home Loan template to get parameter/option UUIDs
curl http://localhost:3000/loan-products
curl http://localhost:3000/loan-products/<loanProductId>/scorecard-templates/active

json{
  "id": "9c3e...template-id",
  "name": "Home Loan Risk Rating Scorecard (Book1 (2).xlsx)",
  "parameters": [
    {
      "id": "param-1-id",
      "name": "Credit Facility Size",
      "weight": 2,
      "options": [
        { "id": "opt-1a-id", "label": "Below Rs. 1M", "points": 1 },
        { "id": "opt-1b-id", "label": "> Rs. 1M < Rs. 2.5M", "points": 2 },
        { "id": "opt-1c-id", "label": "> Rs 2.5 M", "points": 3 }
      ]
    }
  ],
  "gradeBands": [
    { "grade": "A1", "riskCategory": "Low Risk", "minPct": 0, "maxPct": 0.51 }
  ]
}

bash# 2. Preview a score without saving anything (pick one selectedOptionId per parameter)
curl -X POST http://localhost:3000/risk-assessments/preview \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<templateId>",
    "answers": [
      { "parameterId": "<param-1-id>", "selectedOptionId": "<opt-1a-id>" },
      { "parameterId": "<param-2-id>", "selectedOptionId": "<...>" },
      { "parameterId": "<param-3-id>", "selectedOptionId": "<...>" },
      { "parameterId": "<param-4-id>", "selectedOptionId": "<...>" },
      { "parameterId": "<param-5-id>", "selectedOptionId": "<...>" },
      { "parameterId": "<param-6-id>", "selectedOptionId": "<...>" }
    ]
  }'

json{
  "totalRiskScore": 11,
  "maxPossibleScore": 30,
  "aggregateScore": 0.36666666666666664,
  "grade": "A1",
  "riskCategory": "Low Risk",
  "breakdown": [ { "parameterName": "Credit Facility Size", "weight": 2, "point": 1, "weightedScore": 2 } ]
}

bash# 3. Persist a real assessment (same payload shape, plus borrower metadata)
curl -X POST http://localhost:3000/risk-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<templateId>",
    "borrowerName": "Jane Doe",
    "branch": "Kathmandu Branch",
    "baselCode": "HL-2026-001",
    "nextReviewDate": "2027-07-09",
    "completedBy": "RO - Ram Sharma",
    "answers": [ /* one entry per parameter, as above */ ]
  }'

What's out of scope (see the analysis report for the full architecture)

This is the lean scoring API tier: template catalogue + assessment CRUD + the exact compute engine, with no auth or maker-checker approval workflow yet. The original analysis report (CreditScoring_Workbook_Analysis_Report.docx) also specs out ApprovalWorkflowModule (RO → BM → CRD sign-off, mirroring the workbook's signature block) and an AuditModule (change history) for when you're ready to extend this into the full production backend.

#!/usr/bin/env node
/**
 * Standalone, dependency-free verification harness (plain Node, no NestJS/
 * Prisma/TypeScript needed). It re-implements the exact same arithmetic as
 * src/scoring-engine/scoring-engine.service.ts and checks the output against
 * the values actually cached in Book1 (2).xlsx (Risk Rating!E20/D9/D10/D11),
 * so the formula can be sanity-checked in any plain Node environment,
 * including one without npm registry access.
 *
 * Run: node scripts/verify-formula.js
 */

const parameters = [
  { id: 'p1', name: 'Credit Facility Size', weight: 2, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
  { id: 'p2', name: 'DSGIR', weight: 3, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
  { id: 'p3', name: 'Operations of the College / Institution', weight: 2, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
  { id: 'p4', name: 'Satisfactory performance with the Institution', weight: 1, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
  { id: 'p5', name: 'Parents Borrowings with BFIs', weight: 1, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
  { id: 'p6', name: 'Source of Income', weight: 1, options: [
    { id: 'o1', points: 1 }, { id: 'o2', points: 2 }, { id: 'o3', points: 3 },
  ] },
];

const passLoanBands = [
  { grade: 'A1', riskCategory: 'Low Risk', maxPct: 0.51 },
  { grade: 'A2', riskCategory: 'Moderate Risk', maxPct: 0.61 },
  { grade: 'A3', riskCategory: 'Medium Risk', maxPct: 0.71 },
  { grade: 'A4', riskCategory: 'Medium High Risk', maxPct: 0.8 },
];

// --- mirrors ScoringEngineService.computeScore ------------------------------
function computeScore(params, answers) {
  const answerByParam = new Map(answers.map((a) => [a.parameterId, a]));
  const breakdown = params.map((p) => {
    const answer = answerByParam.get(p.id);
    if (!answer) throw new Error(`Missing answer for "${p.name}"`);
    const option = p.options.find((o) => o.id === answer.selectedOptionId);
    if (!option) throw new Error(`Invalid option for "${p.name}"`);
    const point = option.points; // D14:D19
    const weightedScore = p.weight * point; // E14:E19 = C*D
    return { parameterId: p.id, weight: p.weight, point, weightedScore };
  });
  const totalRiskScore = breakdown.reduce((s, b) => s + b.weightedScore, 0); // E20
  const maxPossibleScore = params.reduce((s, p) => s + p.weight * Math.max(...p.options.map((o) => o.points)), 0); // implicit 30
  const aggregateScore = totalRiskScore / maxPossibleScore; // D9
  return { totalRiskScore, maxPossibleScore, aggregateScore, breakdown };
}

// --- mirrors ScoringEngineService.resolveGrade -------------------------------
function resolveGrade(aggregateScore, bands) {
  const sorted = [...bands].sort((a, b) => a.maxPct - b.maxPct);
  for (const band of sorted) {
    if (aggregateScore < band.maxPct) return { grade: band.grade, riskCategory: band.riskCategory };
  }
  return { grade: null, riskCategory: null }; // matches blank D10/D11 for >=80%
}

// --- test 1: exact workbook sample (weights 2,3,2,1,1,1 / points 1,1,1,1,2,1)
const sampleAnswers = [
  { parameterId: 'p1', selectedOptionId: 'o1' },
  { parameterId: 'p2', selectedOptionId: 'o1' },
  { parameterId: 'p3', selectedOptionId: 'o1' },
  { parameterId: 'p4', selectedOptionId: 'o1' },
  { parameterId: 'p5', selectedOptionId: 'o2' },
  { parameterId: 'p6', selectedOptionId: 'o1' },
];

const result = computeScore(parameters, sampleAnswers);
const grade = resolveGrade(result.aggregateScore, passLoanBands);

const expected = {
  totalRiskScore: 11, // Risk Rating!E20 cached value
  maxPossibleScore: 30,
  aggregateScore: 11 / 30, // Risk Rating!D9 cached value = 0.366666...
  grade: 'A1', // Risk Rating!D10 cached value
  riskCategory: 'Low Risk', // Risk Rating!D11 cached value
};

let pass = true;
function check(label, actual, expectedVal) {
  const ok = typeof expectedVal === 'number' ? Math.abs(actual - expectedVal) < 1e-9 : actual === expectedVal;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${actual}, expected ${expectedVal}`);
  if (!ok) pass = false;
}

console.log('--- Workbook sample replication ---');
check('totalRiskScore', result.totalRiskScore, expected.totalRiskScore);
check('maxPossibleScore', result.maxPossibleScore, expected.maxPossibleScore);
check('aggregateScore', result.aggregateScore, expected.aggregateScore);
check('riskGrade', grade.grade, expected.grade);
check('riskDefinition', grade.riskCategory, expected.riskCategory);

// --- test 2: worst case (all points=3) => aggregate 1.0 => ungraded (>=80% gap)
const worst = computeScore(parameters, parameters.map((p) => ({ parameterId: p.id, selectedOptionId: 'o3' })));
const worstGrade = resolveGrade(worst.aggregateScore, passLoanBands);
console.log('\n--- Worst-case / >=80% gap replication ---');
check('worst totalRiskScore', worst.totalRiskScore, 30);
check('worst aggregateScore', worst.aggregateScore, 1);
check('worst riskGrade (should be null, matching blank D10)', worstGrade.grade, null);

console.log(`\n${pass ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
process.exit(pass ? 0 : 1);