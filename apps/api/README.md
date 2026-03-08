# API Service

NestJS API for Vinal Local.

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm --filter api run prisma:generate
```

## Run (from repo root)

```bash
pnpm --filter api start:dev
```

## Endpoints

- `GET /health`
- Swagger UI at `GET /docs`

## Environment

- `PORT`: API port (default: `3000`)
- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `ADMIN_API_KEY`: optional key for internal moderation endpoints (`x-admin-key` header)
- `AUTH_TOKEN_TTL_DAYS`: guest token expiry in days (default: `30`)

## Prisma (PostgreSQL)

This project is set up with Prisma for PostgreSQL foundation only (no business models yet).

Useful commands:

```bash
pnpm --filter api run prisma:generate
pnpm --filter api run prisma:migrate:dev
pnpm --filter api run prisma:migrate:deploy
pnpm --filter api run prisma:seed
pnpm --filter api run prisma:studio
pnpm --filter api run moderation -- pending-vendors
pnpm --filter api run summary:vendor:regenerate -- <vendorId>
```

Initial Vendor migration is generated at:
- `apps/api/prisma/migrations/20260308111200_init_vendor/migration.sql`

To apply migrations locally, make sure PostgreSQL is running and `DATABASE_URL` is correct, then run:

```bash
pnpm --filter api run prisma:migrate:dev
pnpm --filter api run prisma:seed
```

## Vendor AI Summary

- Trigger via API: `POST /vendors/:id/summary/regenerate`
- Trigger via command:

```bash
pnpm --filter api run summary:vendor:regenerate -- <vendorId>
```

## Moderation Endpoints

Internal MVP moderation routes:
- `GET /admin/moderation/vendors/pending`
- `POST /admin/moderation/vendors/:id/approve`
- `POST /admin/moderation/vendors/:id/reject`
- `GET /admin/moderation/reviews/pending`
- `GET /admin/moderation/reviews/flagged`

If `ADMIN_API_KEY` is set, pass it via header:

```bash
x-admin-key: <ADMIN_API_KEY>
```

Operational runbook:
- `docs/moderation-workflow.md`

## MVP Auth Foundation

- `POST /auth/guest` creates a guest user + access token.
- For optional authenticated requests, pass:

```text
Authorization: Bearer <accessToken>
```

Vendor/review submissions attach `userId` when token is valid, and remain anonymous when no token is provided.
