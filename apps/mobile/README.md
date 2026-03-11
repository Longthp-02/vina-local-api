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
- Auth API: `apps/mobile/api/auth.ts`
- Lists API: `apps/mobile/api/lists.ts`
- Auth provider/session: `apps/mobile/auth/`
- Vendor endpoints: `apps/mobile/api/vendors.ts`
- List types: `apps/mobile/types/list.ts`
- Types: `apps/mobile/types/vendor.ts`
- Navigation stack: `apps/mobile/navigation/types.ts`
- Screens:
  - `apps/mobile/screens/HomeScreen.tsx`
  - `apps/mobile/screens/AddVendorScreen.tsx`
  - `apps/mobile/screens/CreateListScreen.tsx`
  - `apps/mobile/screens/CreatorProfileScreen.tsx`
  - `apps/mobile/screens/EditListScreen.tsx`
  - `apps/mobile/screens/FollowingFeedScreen.tsx`
  - `apps/mobile/screens/ListDetailScreen.tsx`
  - `apps/mobile/screens/MapScreen.tsx`
  - `apps/mobile/screens/MyListsScreen.tsx`
  - `apps/mobile/screens/NotificationsScreen.tsx`
  - `apps/mobile/screens/PhoneAuthScreen.tsx`
  - `apps/mobile/screens/PublicListsScreen.tsx`
  - `apps/mobile/screens/TopListsScreen.tsx`
  - `apps/mobile/screens/VendorsScreen.tsx`
  - `apps/mobile/screens/VendorDetailScreen.tsx`
  - `apps/mobile/screens/VerifyCodeScreen.tsx`

## Phone Auth Flow

- Open `Sign In` from the home screen.
- Enter a phone number.
- Check the local API terminal for the 6 digit code.
- Enter the code in the app.
- The app stores the returned bearer token locally and uses it for vendor and review submission.

## Lists Flow

- Open `My Lists` from the home screen.
- Create a private or public list.
- Open vendor detail and use `Save to List`.
- Your saved vendors appear inside the selected list.
- Open `Explore Lists` from the home screen to browse public lists.
- Open `Top Lists` from the home screen to browse high-engagement public lists.
- Tap a creator name to open their profile and public lists.
- Follow a creator to get their new public lists in `Following Feed`.
- Home now shows a small `Suggested Creators` section.
- `Notifications` shows new public lists published by creators you follow.
- Home shows an unread notification count on the notifications button.
- Public list detail now supports simple comments.
- Public lists can be reported for moderation.
- Public list comments can be reported for moderation.
- Add Vendor now uses a small step-by-step flow with HCMC-first district and ward pickers plus a lightweight map pin picker.
- Add Vendor now supports choosing up to 3 photos before submission.
- Vendor detail review submission now supports choosing up to 3 photos.
- If you own a list, you can remove vendors from the list detail screen.
- If you own a list, you can edit or delete it from the list detail screen.
- Public lists can be liked from the list detail screen.

## Photos

- Vendor photos and review photos are uploaded with multipart form data.
- The app uses `expo-image-picker`, so restart Expo after installing dependencies:

```bash
cd apps/mobile
pnpm start -- --clear
```

Example:

```ts
import { getVendors } from "./api";

const vendors = await getVendors({ limit: 20, offset: 0 });
```
