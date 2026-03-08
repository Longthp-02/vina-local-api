# Vinal Local Monorepo

Minimal pnpm monorepo with:
- `apps/mobile` (Expo + TypeScript)
- `apps/api` (NestJS)

## Prerequisites
- Node.js 20+
- pnpm 10+

## Install

```bash
pnpm install
```

## Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Set local API base URL in `apps/mobile/.env`:
- iOS simulator: `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`
- Android emulator: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000`
- Physical device: `EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>:3000`

## Workspace scripts

```bash
pnpm dev         # run mobile + api in parallel
pnpm dev:mobile  # same as: pnpm --filter mobile start
pnpm dev:api     # same as: pnpm --filter api start:dev
pnpm build       # build API
pnpm lint        # run lint in all packages that define lint
pnpm test        # run tests in all packages that define test
pnpm typecheck   # run type checks in all packages that define typecheck
```
