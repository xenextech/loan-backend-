# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

See [AGENTS.md](AGENTS.md) for the full project overview, layout, commands, and conventions — that file is the source of truth and applies here too. This file only adds Claude-specific notes.

## Quick orientation

- NestJS 11 + TypeScript REST API ("Unnati Loan API") for an education loan platform. PostgreSQL via Prisma 7, Supabase storage, JWT auth, nodemailer email.
- Global API prefix `/api/v1`, Swagger at `/api/docs`.
- Feature code lives in `src/modules/<name>/` (module/controller/service/dto per feature). Shared cross-cutting code is in `src/common/`. Data model is defined once in `prisma/schema.prisma`.
- Sibling frontend repo is available as an additional working directory (`edu-loan-frontend`) — check it when an API change needs a matching client-side update.

## Before finishing a change

- `npm run lint` and `npm run format` — Prettier is `singleQuote: true, trailingComma: 'all'`.
- `npm run build` to typecheck (no separate `tsc --noEmit` script exists).
- `npm run test` / `npm run test:e2e` for anything with behavior worth covering — see AGENTS.md's Testing section.
- If `prisma/schema.prisma` changed, run `npx prisma generate` (and a migration if the change is meant to be applied to a database) — see AGENTS.md's Commands section.

## Guardrails

- Never commit `.env` or real secrets; only `.env.example` with placeholders belongs in git.
- Confirm with the user before running `prisma migrate dev/deploy` against anything but a local/dev database — it mutates a real Neon Postgres instance.
- Follow the existing patterns for auth (`JwtAuthGuard`/`RolesGuard`/`@Public()`/`@Roles()`), DTO validation (`class-validator`, whitelist enforced), and response shaping (`ResponseInterceptor`/`GlobalExceptionFilter`) documented in AGENTS.md rather than introducing new patterns.
