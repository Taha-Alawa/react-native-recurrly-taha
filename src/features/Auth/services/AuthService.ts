import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/core/services/firebase";

/**
 * Endpoint definitions for authentication (architecture §4.2).
 *
 * Unlike the Firestore services these deliberately do NOT swallow errors: the
 * auth screens render failures inline next to the field rather than through the
 * global feedback dialog, so the caller needs the thrown error.
 */
const requireAuth = () => {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to .env and restart with --clear.",
    );
  }
  return firebaseAuth;
};

const AuthService = {
  signIn: (email: string, password: string) =>
    signInWithEmailAndPassword(requireAuth(), email, password),

  /** Signs the new user straight in — there is no verification step. */
  signUp: (email: string, password: string) =>
    createUserWithEmailAndPassword(requireAuth(), email, password),

  signOut: () => signOut(requireAuth()),

  /** Unused by the UI today; here for a "forgot password" link. */
  sendPasswordReset: (email: string) =>
    sendPasswordResetEmail(requireAuth(), email),

  getCurrentUser: () => firebaseAuth?.currentUser ?? null,
};

export default AuthService;
