# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

`edu-loan-backend` (Swagger title: "GenZ Loan API") is a NestJS 11 + TypeScript REST API for an education loan application platform ("Cliq Edu Loan"). It handles student loan applications, parent/college verification workflows, document uploads, offer letters/agreements/enrollment certificates, notifications, and an admin dashboard.

- Runtime: Node.js, NestJS 11, TypeScript 5
- Database: PostgreSQL (Neon), accessed via Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`)
- Storage: Supabase Storage (`@supabase/supabase-js`)
- Auth: JWT (`@nestjs/jwt`, `passport-jwt`), bcrypt password hashing
- Email: nodemailer over SMTP
- SMS: to be decided
- API is served under the global prefix `/api/v1`; Swagger docs at `/api/docs`

## Project layout

```
src/
  main.ts               # bootstrap: helmet, CORS, global prefix, pipes/filters/interceptors, Swagger
  app.module.ts          # root module, wires ConfigModule + ThrottlerModule + all feature modules
  config/configuration.ts # typed env config loader (nodeEnv, port, jwt, database, supabase, smtp, app)
  common/
    decorators/          # @Public(), @Roles(), @CurrentUser()
    dto/                 # shared DTOs (pagination, etc.)
    enums/                # app enums; re-exports Prisma enums (UserRole, DocumentType) where relevant
    filters/              # GlobalExceptionFilter
    guards/                # JwtAuthGuard, RolesGuard
    interceptors/          # ResponseInterceptor (wraps responses)
    interfaces/            # JwtPayload, OcrProvider interfaces
  prisma/                 # PrismaModule / PrismaService (injectable PrismaClient wrapper)
  modules/                # one folder per feature/domain module (Nest module + controller + service + dto/)
    auth, users, applications, documents, storage, notifications, audit,
    admin, utils, parents, college, parent-public, offer-letter, agreement,
    enrollment-certificate
prisma/
  schema.prisma           # single source of truth for the data model
  migrations/              # Prisma migrations
test/                      # e2e tests (jest-e2e)
```

Each feature module under `src/modules/<name>/` follows the standard Nest shape: `*.module.ts`, `*.controller.ts`, `*.service.ts`, and a `dto/` subfolder with `class-validator`-annotated DTOs.

## Data model (prisma/schema.prisma)

Core entities: `User` (STUDENT/ADMIN/PARENT/COLLEGE roles) → `LoanApplication` (multi-step form: personal info, identity, address, family, declaration) → `StudyInformation`, `LoanInformation`, `Document`s, `Notification`s, `AuditLog`s, `ApplicationLink`s (tokenized links for parent/college to fill their sections), `CollegeVerification`, `ParentVerification`. Separate standalone template models exist for generated documents: `OfferLetter`, `Agreement`, `EnrollmentCertificate`.

When changing the schema: edit `prisma/schema.prisma`, then run a migration (see Commands) — never hand-edit generated migration SQL or the Prisma client.

## Commands

Run from the repo root (`d:\eduloan-files\edu-loan-backend`).

```bash
npm install                 # install deps

npm run start:dev           # dev server with watch (Nest)
npm run build                # prisma generate && nest build
npm run start:prod           # run compiled dist/main

npm run lint                 # eslint --fix over src/apps/libs/test
npm run format                # prettier --write src/**/*.ts test/**/*.ts

npm run test                  # jest unit tests (rootDir: src, *.spec.ts)
npm run test:watch
npm run test:cov
npm run test:e2e              # jest against test/jest-e2e.json

npx prisma migrate dev --name <change>   # create + apply a migration in dev
npx prisma generate                       # regenerate Prisma client after schema changes
npx prisma studio                         # inspect data locally
```

There is no dedicated typecheck script; `npm run build` (which runs `tsc` via `nest build`) is the way to verify types compile.

## Conventions

- **Formatting**: Prettier config is `{ singleQuote: true, trailingComma: 'all' }`. Run `npm run format` before finishing a change; don't hand-format against these rules.
- **Linting**: ESLint uses `typescript-eslint` recommendedTypeChecked + prettier. Notable relaxed rules: `no-explicit-any` is off, `no-floating-promises` and `no-unsafe-argument` are warnings (not errors). Run `npm run lint` and fix real issues; don't silence warnings just to pass.
- **Validation**: Global `ValidationPipe` has `whitelist: true` and `forbidNonWhitelisted: true` — every request body property must be declared on a DTO with `class-validator` decorators, or the request is rejected. Always add/extend DTOs in the module's `dto/` folder rather than accepting loose objects.
- **Auth pattern**: `JwtAuthGuard` + `RolesGuard` are the standard combo for protecting routes; use the `@Public()` decorator to opt a route out of auth, and `@Roles(UserRole.ADMIN, ...)` to restrict by role. Use `@CurrentUser()` to pull the authenticated `JwtPayload` off the request instead of reading `req.user` directly.
- **Responses/errors**: Don't throw raw errors or format responses manually — the global `ResponseInterceptor` and `GlobalExceptionFilter` already normalize success/error payloads. Throw standard Nest HTTP exceptions (`NotFoundException`, `ForbiddenException`, etc.) and let the filter handle shaping.
- **Enums**: `UserRole` and `DocumentType` are defined in `prisma/schema.prisma` and re-exported from `src/common/enums/index.ts` — import them from `common/enums`, not directly from `@prisma/client`, and don't redefine them locally.
- **Prisma access**: Inject `PrismaService` from `src/prisma/prisma.module.ts` into feature services; don't instantiate `PrismaClient` directly elsewhere.
- **File uploads**: Handled through the `storage` module (Supabase-backed) and `multer`; document metadata is persisted on the relevant Prisma model (`Document`, or the embedded document fields on `ParentProfile`/`CollegeVerification`/`ParentVerification`), not as separate files on disk.
- **Secrets/config**: All environment access goes through `ConfigService` reading `src/config/configuration.ts`, never `process.env` directly in feature code. `.env.example` documents required variables (DB, JWT, Supabase, SMTP, app URLs) — update it when adding a new env var.
- **New modules**: Follow the existing module shape (module/controller/service/dto) and register the module in `src/app.module.ts`.

## Testing

- Unit tests are colocated as `*.spec.ts` next to the code they test (jest `rootDir` is `src`).
- E2E tests live in `test/` and run against `test/jest-e2e.json`.
- There is minimal existing test coverage (mainly `app.controller.spec.ts` and `test/app.e2e-spec.ts`) — when adding non-trivial logic (e.g. EMI calculator, eligibility rules, auth flows), add or extend spec files rather than leaving it untested.

## Safety notes for agents

- Do not commit `.env` or real secrets; only `.env.example` (with placeholder values) belongs in git.
- Prisma migrations are applied against a real Postgres (Neon) database — treat `prisma migrate dev`/`deploy` as a state-changing operation and confirm with the user before running it against anything other than a local/dev database.
- This repo has a sibling frontend at `edu-loan-frontend` (configured as an additional working directory) — check there if a change needs a matching API contract update (DTO shape, route path, enum values).
