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
pnpm --filter api run moderation -- reported-lists
pnpm --filter api run moderation -- hidden-lists
pnpm --filter api run moderation -- hide-list <listId>
pnpm --filter api run moderation -- restore-list <listId>
pnpm --filter api run moderation -- clear-list-reports <listId>
pnpm --filter api run moderation -- reported-list-comments
pnpm --filter api run moderation -- hidden-list-comments
pnpm --filter api run moderation -- hide-list-comment <commentId>
pnpm --filter api run moderation -- restore-list-comment <commentId>
pnpm --filter api run moderation -- clear-list-comment-reports <commentId>
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

When `ADMIN_API_KEY` is set on backend, include header:

```text
x-admin-key: <ADMIN_API_KEY>
```
