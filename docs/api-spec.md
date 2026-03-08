# API Spec (Starter)

## Base URL
- Local: `http://localhost:3000`

## Endpoints

### `GET /`
- Description: Health-style starter endpoint
- Response: `"Hello World!"`

### `GET /health`
- Description: Basic service health check
- Response:
  - `status`: `"ok"`
  - `service`: `"api"`
  - `timestamp`: ISO datetime string

### `GET /docs`
- Description: Swagger UI

### `POST /auth/guest`
- Description: Create guest user session and return access token

### `POST /vendors`
- Description: Submit a new vendor for moderation
- Note: `status` is set to `PENDING` by default

### `GET /vendors/:id/reviews`
- Description: List reviews for a vendor

### `POST /vendors/:id/reviews`
- Description: Submit a review for a vendor
- Note: `status` is set to `PENDING` by default

### `GET /vendors/nearby`
- Description: Find nearby vendors by coordinates
- Query params:
  - `latitude` (required)
  - `longitude` (required)
  - `radiusKm` (optional, default: `5`)

### `POST /vendors/:id/summary/regenerate`
- Description: Regenerate AI summary for a vendor from review text

### `GET /admin/moderation/vendors/pending`
- Description: List vendors pending moderation

### `POST /admin/moderation/vendors/:id/approve`
- Description: Approve a vendor

### `POST /admin/moderation/vendors/:id/reject`
- Description: Reject a vendor

### `GET /admin/moderation/reviews/pending`
- Description: List pending reviews

### `GET /admin/moderation/reviews/flagged`
- Description: List flagged/rejected reviews
