# Mobile App

Expo + TypeScript app for Vinal Local.

## Setup

```bash
pnpm install
cp apps/mobile/.env.example apps/mobile/.env
```

## Run (from repo root)

```bash
pnpm --filter mobile start
```

## Environment

- `EXPO_PUBLIC_API_BASE_URL`: base URL for API requests.

Local examples:
- iOS simulator: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Physical device: `http://<your-local-ip>:3000`

## API Client

- Base request helper: `apps/mobile/api/client.ts`
- Vendor endpoints: `apps/mobile/api/vendors.ts`
- Types: `apps/mobile/types/vendor.ts`
- Navigation stack: `apps/mobile/navigation/types.ts`
- Screens:
  - `apps/mobile/screens/HomeScreen.tsx`
  - `apps/mobile/screens/AddVendorScreen.tsx`
  - `apps/mobile/screens/MapScreen.tsx`
  - `apps/mobile/screens/VendorsScreen.tsx`
  - `apps/mobile/screens/VendorDetailScreen.tsx`

Example:

```ts
import { getVendors } from "./api";

const vendors = await getVendors({ limit: 20, offset: 0 });
```
