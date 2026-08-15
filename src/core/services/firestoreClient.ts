import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import i18n from "@/core/i18n";
import feedbackService from "@/core/services/feedbackService";
import { firestore, isFirebaseConfigured } from "@/core/services/firebase";

/**
 * The low-level request wrapper (architecture §4.1).
 *
 * Everything transport-related lives here and nowhere else:
 *   - which Firestore project to talk to
 *   - user scoping, read from the session store below
 *   - permission-denied handling (terminate session, hand off to the app)
 *   - error parsing into a language-appropriate message, pushed to the global
 *     feedback service
 *   - a uniform success envelope, so every caller reads the same shape
 *
 * Consequence: no hook or component contains a try/catch for transport, a user
 * id lookup, or an error toast.
 */

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const USERS_COLLECTION = "users";

/** True when a real read/write can succeed: configured AND signed in. */
export const isRemoteEnabled = () =>
  isFirebaseConfigured && Boolean(firestore) && Boolean(activeUserId);

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

let activeUserId: string | null = null;

/** Mirrors the Clerk session into the transport layer. Set by AuthBridge. */
export const setActiveUserId = (userId: string | null) => {
  activeUserId = userId;
};

export const getActiveUserId = () => activeUserId;

let unauthorizedHandler: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

const messageForError = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? "unknown";
  const key = `errors.firestore.${code}`;
  const translated = i18n.t(key);
  if (translated !== key) return translated;
  return i18n.t("errors.firestore.default", "Something went wrong. Please try again.");
};

/* -------------------------------------------------------------------------- */
/* Request                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Runs a Firestore operation inside the shared error envelope.
 *
 * Firestore is the only source of truth, so the pre-flight checks below fail
 * loudly with an actionable message rather than silently. Without them a
 * missing Clerk->Firebase session would surface as a bare `permission-denied`,
 * which says nothing about what to actually go and fix.
 */
export const request = async <T>(
  operation: () => Promise<T>,
): Promise<Result<T>> => {
  if (!isFirebaseConfigured || !firestore) {
    const message = i18n.t(
      "errors.firestore.not-configured",
      "Firebase isn't configured. Add the EXPO_PUBLIC_FIREBASE_* values to .env and restart.",
    );
    feedbackService.show("error", message);
    return { success: false, error: message };
  }

  if (!activeUserId) {
    const message = i18n.t(
      "errors.firestore.no-session",
      "You're signed out. Sign in again to continue.",
    );
    feedbackService.show("error", message);
    return { success: false, error: message };
  }

  try {
    return { success: true, data: await operation() };
  } catch (error) {
    const code = (error as { code?: string })?.code;

    // Only a genuinely absent session terminates the app session.
    // `permission-denied` means "authenticated but not allowed" — signing out
    // on it would loop: sign in -> denied -> signed out -> sign in -> …
    if (code === "unauthenticated") {
      unauthorizedHandler?.();
    }

    const message = messageForError(error);
    feedbackService.show("error", message);
    return { success: false, error: message };
  }
};

const requireFirestore = () => {
  if (!firestore) throw new Error("Firestore is not configured");
  return firestore;
};

const requireUser = () => {
  if (!activeUserId) throw new Error("No active user");
  return activeUserId;
};

/* -------------------------------------------------------------------------- */
/* Facades                                                                     */
/* -------------------------------------------------------------------------- */

/** Everything under `users/{activeUserId}` — the authenticated facade. */
export const authenticatedDb = {
  request,
  /** `users/{uid}` */
  userDoc: (): DocumentReference =>
    doc(requireFirestore(), USERS_COLLECTION, requireUser()),
  /** `users/{uid}/{name}` */
  collection: (name: string): CollectionReference =>
    collection(requireFirestore(), USERS_COLLECTION, requireUser(), name),
  /** `users/{uid}/{name}/{id}` */
  doc: (name: string, id: string): DocumentReference =>
    doc(requireFirestore(), USERS_COLLECTION, requireUser(), name, id),
};

/** Root-level collections readable without a user — the anonymous facade. */
export const publicDb = {
  request,
  collection: (name: string): CollectionReference =>
    collection(requireFirestore(), name),
  doc: (name: string, id: string): DocumentReference =>
    doc(requireFirestore(), name, id),
};

export default authenticatedDb;
