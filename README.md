# HB+ Google Authentication Application

A cross-platform React Native application for web, Android, and iOS. It authenticates users with Google through Firebase and restricts access to accounts whose email addresses end in `@hbplus.fit`.

## Features

- Google Sign-In
- `@hbplus.fit` email-domain restriction
- Protected dashboard route
- Loading and authentication error states
- Logout
- Firebase Authentication and Firestore
- Optional Firestore role display (`Admin` or `User`)
- Responsive React Native for Web UI

## Project Structure

```text
frontend/                 Expo React Native application
  src/config/firebase.js  Firebase initialization
  src/context/AuthContext.js
  src/components/         Shared UI and route protection
  src/screens/            Login and dashboard screens
  src/utils/              Domain validation
  .env                    Local environment configuration

backend/
  firebase.json           Firebase CLI configuration
  firestore.rules         Firestore security rules
```

## Prerequisites

- Node.js and npm
- An Expo-compatible browser or emulator
- A Firebase project
- Google OAuth client configuration
- Android Studio for native Android builds
- macOS and Xcode for native iOS builds

## Setup

### 1. Install frontend dependencies

```powershell
cd C:\Users\ranji\Desktop\HB+\frontend
npm install
```

### 2. Configure environment variables

Create `frontend/.env` with the application credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID

EXPO_PUBLIC_ALLOWED_DOMAIN=@hbplus.fit
EXPO_PUBLIC_OAUTH_SCHEME=hb-plus-auth
```

Do not commit `.env`. It contains project-specific configuration.

### 3. Enable Firebase Authentication

In Firebase Console:

1. Open **Authentication**.
2. Select **Sign-in method**.
3. Enable **Google**.
4. Add `localhost` to **Authentication > Settings > Authorized domains** for web testing.

### 4. Configure native applications

Android:

- Place `google-services.json` at `frontend/android/app/google-services.json`.
- Ensure the Android package name matches the Firebase Android package.
- Add debug and release SHA-1/SHA-256 fingerprints in Firebase.

iOS:

- Place `GoogleService-Info.plist` in the iOS project.
- Ensure the bundle identifier matches the Firebase iOS app.
- Configure macOS/Xcode and the iOS OAuth URL scheme.

### 5. Deploy Firestore rules

Using Firebase CLI:

```powershell
cd C:\Users\ranji\Desktop\HB+\backend
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules
```

The rules in `backend/firestore.rules` allow official-domain users to read or create only their own `users/{uid}` document.

## Run the Application

Web:

```powershell
cd C:\Users\ranji\Desktop\HB+\frontend
npm run dev
```

Open `http://localhost:8081`.

Android:

```powershell
cd C:\Users\ranji\Desktop\HB+\frontend
npx expo run:android
```

iOS:

```powershell
cd C:\Users\ranji\Desktop\HB+\frontend
npx expo run:ios
```

iOS builds must be run from macOS with Xcode installed.

## Authentication Flow

1. The user opens the login page.
2. The user selects **Login with Google**.
3. Firebase completes Google authentication.
4. The application reads the authenticated account's email.
5. `isAllowedDomain()` validates the email in the client.
6. The application signs out and sets the domain error for addresses outside `@hbplus.fit`.
7. An allowed account receives or creates a default `User` profile in Firestore.
8. The application redirects the user to the protected dashboard.

## Domain Restriction

The allowed domain is configured by `EXPO_PUBLIC_ALLOWED_DOMAIN` and defaults to `@hbplus.fit`.

The domain check is:

```js
email.toLowerCase().trim().endsWith(ALLOWED_DOMAIN.toLowerCase().trim())
```

Firebase Firestore also enforces the domain independently using the authenticated token email:

```text
request.auth.token.email matches .*@hbplus\.fit$
```

Client checks improve the user experience, while Firestore rules provide server-side data protection.

## Error Handling

The login page shows this message when Google authentication returns a non-HB+ email:

```text
Access restricted. Please login using your official domain email.
```

Network, popup cancellation, and other Firebase authentication failures also produce user-friendly messages.

## Security Notes

- Do not expose private service-account keys in the frontend.
- The Firebase web API key identifies the Firebase project and is not a private credential.
- Keep `.env` local and do not commit it.
- Deploy Firestore rules and restrict access by both authentication state and email domain.
- Use HTTPS and authorized domains in production.
