# Codex Rules — Vinal Local

## Product context
Vinal Local is a Vietnam-focused local food discovery app.
Slogan: "Bản đồ cho người sành ăn".

## Repo structure
- `apps/mobile`: React Native + Expo
- `apps/api`: NestJS backend
- `docs/`: project docs

## Main rules
1. Keep the MVP small and practical.
2. Do not add complex features unless explicitly requested.
3. Prefer readable and modular code.
4. Follow the existing structure and naming style.
5. Update docs when architecture or API changes.

## Mobile rules
- Use TypeScript
- Use functional components
- Use TanStack Query for server state
- Use Zustand only for light local state
- Keep screens simple

## Backend rules
- Use NestJS modules/controllers/services cleanly
- Use Prisma for DB access
- Validate DTOs
- Keep business logic in services
- Avoid putting complex logic in controllers

## Git rules
- Use focused commits
- Use conventional commits: feat, fix, docs, chore, refactor

## MVP scope
Current MVP includes:
- auth
- nearby/trending vendors
- vendor detail
- add vendor
- reviews + photos
- admin moderation
- AI summary

Not in MVP unless requested:
- payments
- subscriptions
- delivery
- chat
- advanced social features