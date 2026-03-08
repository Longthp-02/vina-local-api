# Moderation Workflow (MVP)

This project uses a backend-only moderation flow for practical MVP operations.

## Prerequisites

1. API running:

```bash
pnpm --filter api start:dev
```

2. Optional admin key (if configured in `apps/api/.env`):

```bash
export ADMIN_API_KEY=dev-admin-key
```

## Fast Path (CLI helper)

Use the built-in moderation script:

```bash
pnpm --filter api run moderation -- pending-vendors
pnpm --filter api run moderation -- approve-vendor <vendorId>
pnpm --filter api run moderation -- reject-vendor <vendorId>
pnpm --filter api run moderation -- pending-reviews
pnpm --filter api run moderation -- flagged-reviews
```

Optional API URL override:

```bash
API_BASE_URL=http://localhost:3000 pnpm --filter api run moderation -- pending-vendors
```

## Direct API Routes

- `GET /admin/moderation/vendors/pending`
- `POST /admin/moderation/vendors/:id/approve`
- `POST /admin/moderation/vendors/:id/reject`
- `GET /admin/moderation/reviews/pending`
- `GET /admin/moderation/reviews/flagged`

When `ADMIN_API_KEY` is set on backend, include header:

```text
x-admin-key: <ADMIN_API_KEY>
```
