import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { resolveAuthPersistence } from "@/core/services/authPersistence";

/**
 * Firebase configuration. These values are public by design — Firebase security
 * is enforced by Firestore rules, not by hiding the config. They still live in
 * .env so a different project can be swapped in per environment.
 *
 * Each var must be referenced as a literal `process.env.EXPO_PUBLIC_*` member
 * expression: Expo inlines them at build time by static analysis, so computed
 * lookups (`process.env[name]`) would resolve to undefined on device.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const PLACEHOLDER_PREFIX = "your_";

/**
 * Shape checks per key. A value can be present and still wrong — a stray quote
 * from .env, a trailing space, or a value pasted from the wrong project — and
 * those failures otherwise surface much later as an opaque auth or Firestore
 * error. Catching them at startup turns that into one clear log line.
 */
const SHAPE_CHECKS: Record<string, (value: string) => boolean> = {
  apiKey: (value) => value.startsWith("AIza"),
  authDomain: (value) => /\.(firebaseapp\.com|web\.app)$/.test(value),
  projectId: (value) => /^[a-z0-9-]+$/.test(value),
  storageBucket: (value) => /\.(appspot\.com|firebasestorage\.app)$/.test(value),
  messagingSenderId: (value) => /^[0-9]+$/.test(value),
  appId: (value) => /^1:[0-9]+:(web|android|ios):/.test(value),
};

const malformedKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => {
    if (typeof value !== "string" || !value.length) return false;
    if (value.startsWith(PLACEHOLDER_PREFIX)) return false;
    return !SHAPE_CHECKS[key]?.(value);
  })
  .map(([key]) => key);

const missingKeys = Object.entries(firebaseConfig)
  .filter(
    ([, value]) =>
      typeof value !== "string" ||
      !value.length ||
      value.startsWith(PLACEHOLDER_PREFIX),
  )
  .map(([key]) => key);

/** True only when every value is present, non-placeholder and well-formed. */
export const isFirebaseConfigured =
  missingKeys.length === 0 && malformedKeys.length === 0;

if (__DEV__ && malformedKeys.length) {
  console.error(
    `[firebase] These EXPO_PUBLIC_FIREBASE_* values are present but malformed: ${malformedKeys.join(", ")}.\n` +
      "Common causes: quotes around the value in .env, a trailing space, or a value " +
      "copied from a different project. Fix .env, then restart with `npx expo start --clear`.",
  );
}

let app: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig as Required<typeof firebaseConfig>);

  // React Native's networking stack does not support the gRPC-Web streaming
  // transport Firestore prefers, so force long polling. Without this the first
  // read hangs instead of failing loudly.
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });

  // Firebase owns sign-in, so the session must survive app restarts —
  // otherwise every launch would dump the user back on the sign-in screen.
  try {
    const persistence = resolveAuthPersistence();
    authInstance = persistence
      ? initializeAuth(app, { persistence })
      : initializeAuth(app);
  } catch {
    // Already initialised (Fast Refresh re-runs this module).
    authInstance = getAuth(app);
  }

  storageInstance = getStorage(app);
} else if (__DEV__ && missingKeys.length) {
  console.error(
    `[firebase] Missing or placeholder EXPO_PUBLIC_FIREBASE_* values: ${missingKeys.join(", ")}.\n` +
      "Nothing can sign in or persist until these are set. Fill in .env, then restart " +
      "with `npx expo start --clear` — Expo inlines these at build time, so a plain " +
      "reload will not pick them up.",
  );
}

export const firebaseApp = app;
export const firestore = firestoreInstance;
export const firebaseAuth = authInstance;
export const firebaseStorage = storageInstance;

export default firebaseApp;
