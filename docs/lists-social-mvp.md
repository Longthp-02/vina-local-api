# Lists Social MVP

## Goal
Add a lightweight list-based curation layer on top of vendor discovery.

Users should be able to:
- create custom vendor lists
- save vendors into lists
- browse public lists from other users
- like public lists
- discover top lists based on simple engagement

This should stay MVP-sized. It is not a full social network.

## Product direction
Lists are the primary social object, not posts.

Good examples:
- best bun bo in district 1
- cheap eats under 50k
- date-night cafes
- late-night spots
- places I bring friends to

## Phase scope

### Phase 1: Lists
Build:
- create list
- edit list
- delete list
- add vendor to list
- remove vendor from list
- public/private visibility
- view a public list
- browse public lists

Do not build yet:
- follows
- feed
- comments on lists
- notifications
- collaborative lists

### Phase 2: Social signals
Build:
- like a public list
- view counting
- top lists
- creator profile basics

Do not build yet:
- algorithmic ranking
- recommended creators
- repost/share mechanics

### Phase 3: Social graph
Build:
- follow user
- following feed for newly created public lists

Keep out of scope for now:
- chat
- stories
- full profile system

## MVP entities

### `VendorList`
Represents a user-created list.

Suggested fields:
- `id`
- `userId`
- `title`
- `slug`
- `description`
- `visibility` (`PRIVATE`, `PUBLIC`)
- `likeCount`
- `viewCount`
- `itemCount`
- `createdAt`
- `updatedAt`

### `VendorListItem`
Represents a vendor saved into a list.

Suggested fields:
- `id`
- `listId`
- `vendorId`
- `note` (nullable, optional later)
- `position`
- `createdAt`

### `VendorListLike`
Represents a user liking a public list.

Suggested fields:
- `id`
- `listId`
- `userId`
- `createdAt`

### `UserFollow`
Not phase 1. Prepare later.

Suggested fields:
- `id`
- `followerUserId`
- `followingUserId`
- `createdAt`

## Naming guidance
- Use `VendorList` instead of generic `List`
- Use `VendorListItem` instead of `SavedVendor`
- Keep social signals separate from the core list record where useful

## Prisma model direction

### Phase 1
- `VendorList`
- `VendorListItem`

### Phase 2
- `VendorListLike`

### Phase 3
- `UserFollow`

## Backend API shape

### Phase 1 endpoints
- `GET /lists/public`
- `GET /lists/:id`
- `POST /lists`
- `PATCH /lists/:id`
- `DELETE /lists/:id`
- `POST /lists/:id/vendors`
- `DELETE /lists/:id/vendors/:vendorId`
- `GET /users/me/lists`

Notes:
- create/edit/delete require auth
- private lists are visible only to their owner
- public list detail is visible to everyone
- list ownership checks stay in service layer

### Phase 2 endpoints
- `POST /lists/:id/like`
- `DELETE /lists/:id/like`
- `GET /lists/top`
- `GET /users/:id/lists`

### Phase 3 endpoints
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`
- `GET /feed/lists`

## Mobile screen plan

### Phase 1 screens
- `My Lists`
- `Create List`
- `List Detail`
- vendor detail action: `Save to List`
- public `Explore Lists`

### Phase 2 screens
- top lists section
- creator lists screen

### Phase 3 screens
- following feed

## Ranking logic
Keep it simple at first.

### Top lists
Start with:
- `PUBLIC` lists only
- order by `likeCount desc`, then `viewCount desc`, then `updatedAt desc`

This is enough for MVP. Do not build a complex score yet.

### View counting
Start with coarse counting:
- increment when a public list detail screen is opened
- no need for perfect unique-view tracking yet

## Auth and permissions
- authenticated users can create and manage their own lists
- anyone can browse public lists
- only authenticated users can like lists
- only list owners can edit/delete their own lists
- private lists should never appear in public endpoints

## Moderation implications
Public lists create new moderation needs.

Minimum moderation needs:
- ability to hide/remove abusive public lists later
- basic title/description review if abuse becomes common

Do not build a full moderation UI for lists yet unless needed.

## Analytics signals
Track only what is directly useful:
- public list views
- public list likes
- list item count

Avoid vanity metrics beyond that for now.

## Recommended implementation order
1. Prisma models for `VendorList` and `VendorListItem`
2. NestJS `lists` module with CRUD + add/remove vendor endpoints
3. Mobile `My Lists` and `Create List`
4. Vendor detail `Save to List`
5. Public `Explore Lists`
6. `VendorListLike`
7. `Top Lists`
8. `UserFollow`
9. `Following Feed`

## What not to build in the first slice
- comments on lists
- collaborative lists
- hashtags
- content recommendation engine
- notifications
- rich creator profiles
- infinite social feed

## Recommendation
Build phase 1 first and validate whether users actually create and browse lists.

If list creation and public browsing are strong, then phase 2 is justified.
If users do not use lists, stop before building follows and feeds.
