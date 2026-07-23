# Mini Social Feed — Mobile App

React Native (Expo SDK 57) client for the Mini Social Feed backend. Auth, a
paginated feed with likes/comments, a create-post form, a username filter,
and push notifications for likes/comments.

## Stack

- **Expo SDK 57** (React Native 0.86, React 19.2, New Architecture on)
- **NativeWind v4** (Tailwind CSS for React Native)
- **React Navigation** (native-stack for auth, bottom-tabs for the app)
- **Axios** for the API client, **expo-secure-store** for the JWT
- **expo-notifications** for push (see the FCM note below)

## Setup

```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```

### Pointing at your backend

Edit `.env`:

| Situation                                       | `EXPO_PUBLIC_API_URL`                  |
| ----------------------------------------------- | -------------------------------------- |
| Android emulator, backend on your host machine  | `http://10.0.2.2:5000/api`             |
| Physical device, same Wi-Fi as your dev machine | `http://<your-LAN-IP>:5000/api`        |
| iOS simulator                                   | `http://localhost:5000/api`            |
| Deployed backend                                | `https://your-backend.example.com/api` |

`app.json`'s `extra.apiUrl` is used as a fallback if the env var isn't set.

## Push notifications (FCM) — current state

This project does **not** ship a `google-services.json` yet, so there's no
real Firebase project wired up. Instead, `src/services/notifications.ts` goes
through **Expo's push service** (`getExpoPushTokenAsync`), which itself sits
on top of FCM on Android — no Firebase console setup is required to get a
real push token in a **development build**.

If a real token can't be obtained (running in a simulator, no EAS project id
configured yet, permission denied, etc.) the service falls back to a
**mock token** (`mock-token-...`) so you can develop and demo the full
like → notify → tap → open feed flow without blocking on Firebase setup.
This mock token is still sent to `PATCH /api/auth/fcm-token` like a real one.

**To wire up real Firebase/FCM:**

1. Create a Firebase project, add an Android app with package
   `com.minisocialfeed.app`, download `google-services.json` into `mobile/`.
2. Reference it in `app.json` → `expo.android.googleServicesFile`.
3. Run `eas init` to get a real `extra.eas.projectId` (already read by
   `notifications.ts`).
4. Build a dev/preview build (`eas build --profile preview -p android`) —
   Expo Go and simulators can't receive real remote push notifications.

## Building the APK

```bash
npm install -g eas-cli
eas login
eas build:configure
npm run build:apk
```

EAS will give you a download link when the build finishes; that's the file
to share as your "Google Drive download link" deliverable (upload the
downloaded `.apk` to Drive and share the link).

## Notes on API contract assumptions

- The feed's inline `comments` array is capped at 3 by the backend; the
  comment sheet shows what's loaded on the post object and relies on
  `commentCount` to know when to say "View all N comments."
- Likes are optimistic in the UI (instant heart toggle) and reconciled
  against the real `POST /posts/:id/like` response; on failure the feed
  re-fetches to correct any drift.
- All authenticated requests attach `Authorization: Bearer <token>` via an
  axios interceptor; a `401` anywhere clears the stored token and drops the
  user back to the login screen.
