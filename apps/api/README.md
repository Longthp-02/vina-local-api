# API Service

NestJS API for Vinal Local.

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up
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
- `PHONE_VERIFICATION_TTL_MINUTES`: verification code expiry in minutes (default: `5`)
- Uploaded vendor and review photos are stored locally under `apps/api/uploads` and served from `/uploads/*`

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
pnpm db:up
pnpm --filter api run prisma:migrate:dev
pnpm --filter api run prisma:seed
```

The seed now includes:
- sample vendors
- demo users
- public/private lists
- likes, follows, comments, notifications
- a few reported/hidden moderation examples

## Vendor AI Summary

- Trigger via API: `POST /vendors/:id/summary/regenerate`
- Trigger via command:

```bash
pnpm --filter api run summary:vendor:regenerate -- <vendorId>
```

## Vendor Lists Phase 1

Available endpoints:
- `GET /lists/public`
- `GET /lists/top`
- `GET /feed/lists`
- `GET /users/suggested-creators`
- `GET /notifications`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `GET /lists/:id`
- `GET /lists/:id/comments`
- `POST /lists`
- `POST /lists/:id/comments`
- `POST /lists/:id/report`
- `PATCH /lists/:id`
- `DELETE /lists/:id`
- `POST /lists/:id/vendors`
- `DELETE /lists/:id/vendors/:vendorId`
- `POST /lists/:id/like`
- `DELETE /lists/:id/like`
- `GET /users/me/lists`
- `GET /users/:id/profile`
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`

Rules:
- public lists are readable by everyone
- private lists are visible only to their owner
- creating and editing lists requires authentication
- only approved vendors can be added to lists
- public list detail increments a simple view counter
- public lists can be liked by authenticated users
- creators expose public lists through a simple profile endpoint
- followed creators appear in the authenticated user's feed
- suggested creators are derived from public-list activity and follower signals
- followers receive in-app notifications when a creator publishes a new public list
- public lists support simple comments
- public lists can be reported by authenticated users
- public list comments can be reported by authenticated users

## Moderation Endpoints

Internal MVP moderation routes:
- `GET /admin/moderation/vendors/pending`
- `POST /admin/moderation/vendors/:id/approve`
- `POST /admin/moderation/vendors/:id/reject`
- `GET /admin/moderation/reviews/pending`
- `GET /admin/moderation/reviews/flagged`
- `GET /admin/moderation/lists/reported`
- `GET /admin/moderation/lists/hidden`
- `POST /admin/moderation/lists/:id/hide`
- `POST /admin/moderation/lists/:id/restore`
- `POST /admin/moderation/lists/:id/clear-reports`
- `GET /admin/moderation/list-comments/reported`
- `GET /admin/moderation/list-comments/hidden`
- `POST /admin/moderation/list-comments/:id/hide`
- `POST /admin/moderation/list-comments/:id/restore`
- `POST /admin/moderation/list-comments/:id/clear-reports`

If `ADMIN_API_KEY` is set, pass it via header:

```bash
x-admin-key: <ADMIN_API_KEY>
```

Operational runbook:
- `docs/moderation-workflow.md`

## MVP Auth

- `POST /auth/request-code` generates a 6 digit verification code for a phone number.
- `POST /auth/verify-code` verifies that code and returns an access token.
- `GET /auth/me` returns the current authenticated user.
- `POST /auth/guest` still exists for local fallback, but the main mobile flow should use phone verification.
- In local development, the API prints the verification code to the server logs.
- For authenticated requests, pass:

```text
Authorization: Bearer <accessToken>
```

Vendor and review submission now require a valid authenticated user token.

## Photos

- `POST /vendors` now accepts multipart form data with up to 3 image files in the `photos` field.
- `POST /vendors/:id/reviews` now accepts multipart form data with up to 3 image files in the `photos` field.
- Uploaded files are stored locally for MVP development:
  - disk path: `apps/api/uploads`
  - public path: `/uploads/...`
- Prisma stores photo metadata in:
  - `VendorPhoto`
  - `ReviewPhoto`
