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

### `POST /auth/request-code`
- Description: Generate a 6 digit phone verification code
- Note: local development logs the code in the API server output

### `POST /auth/verify-code`
- Description: Verify a phone code and return an access token

### `GET /auth/me`
- Description: Return the current authenticated user

### `GET /lists/public`
- Description: Browse public vendor lists

### `GET /lists/top`
- Description: Browse top public lists ordered by likes and views

### `GET /feed/lists`
- Description: Browse public lists from creators the current user follows
- Auth: required

### `GET /users/suggested-creators`
- Description: Return suggested creators with public list activity and simple follower signals

### `GET /notifications`
- Description: Return the current user's in-app notifications
- Auth: required

### `POST /notifications/:id/read`
- Description: Mark one notification as read
- Auth: required

### `POST /notifications/read-all`
- Description: Mark all notifications as read
- Auth: required

### `GET /lists/:id`
- Description: Get a single list
- Note: private lists are visible only to their owner

### `GET /lists/:id/comments`
- Description: List comments for a list
- Note: private lists are only visible to their owner

### `POST /lists`
- Description: Create a vendor list
- Auth: required

### `POST /lists/:id/comments`
- Description: Add a comment to a public list
- Auth: required

### `POST /lists/:id/report`
- Description: Report a public list for moderation
- Auth: required

### `POST /lists/comments/:id/report`
- Description: Report a public list comment for moderation
- Auth: required

### `PATCH /lists/:id`
- Description: Update a vendor list you own
- Auth: required

### `DELETE /lists/:id`
- Description: Delete a vendor list you own
- Auth: required

### `POST /lists/:id/vendors`
- Description: Add an approved vendor to a list you own
- Auth: required

### `DELETE /lists/:id/vendors/:vendorId`
- Description: Remove a vendor from a list you own
- Auth: required

### `POST /lists/:id/like`
- Description: Like a public list
- Auth: required

### `DELETE /lists/:id/like`
- Description: Unlike a public list
- Auth: required

### `GET /users/me/lists`
- Description: List the current user's lists
- Auth: required

### `GET /users/:id/profile`
- Description: Get a creator profile with public lists and follow state

### `POST /users/:id/follow`
- Description: Follow a creator
- Auth: required

### `DELETE /users/:id/follow`
- Description: Unfollow a creator
- Auth: required

### `POST /vendors`
- Description: Submit a new vendor for moderation
- Note: `status` is set to `PENDING` by default
- Note: accepts multipart form data and up to 3 image files in `photos`
- Auth: required

### `GET /vendors/:id/reviews`
- Description: List reviews for a vendor

### `POST /vendors/:id/reviews`
- Description: Submit a review for a vendor
- Note: `status` is set to `PENDING` by default
- Note: accepts multipart form data and up to 3 image files in `photos`
- Auth: required

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

### `GET /admin/moderation/lists/reported`
- Description: List reported public lists that still need moderation

### `GET /admin/moderation/lists/hidden`
- Description: List hidden public lists for audit and restoration

### `POST /admin/moderation/lists/:id/hide`
- Description: Hide a reported public list from public discovery

### `POST /admin/moderation/lists/:id/restore`
- Description: Restore a previously hidden public list

### `POST /admin/moderation/lists/:id/clear-reports`
- Description: Clear false-positive report state from a public list

### `GET /admin/moderation/list-comments/reported`
- Description: List reported list comments that still need moderation

### `GET /admin/moderation/list-comments/hidden`
- Description: List hidden list comments for audit and restoration

### `POST /admin/moderation/list-comments/:id/hide`
- Description: Hide a reported list comment from public view

### `POST /admin/moderation/list-comments/:id/restore`
- Description: Restore a previously hidden list comment

### `POST /admin/moderation/list-comments/:id/clear-reports`
- Description: Clear false-positive report state from a list comment
