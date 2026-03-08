# Architecture

## Monorepo
- Package manager: `pnpm`
- Workspace: `apps/*`

## Applications
- `apps/mobile`: Expo + TypeScript mobile app
- `apps/api`: NestJS backend API

## Runtime
- Mobile talks to API over HTTP
- API runs as a standalone Node.js service
