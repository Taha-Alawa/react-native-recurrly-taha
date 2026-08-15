import { createStore } from "@/core/store/createStore";

/**
 * Client mirror of the Firebase session (architecture §11).
 *
 * Firebase Auth is the identity provider. This store is the single place the
 * rest of the app reads the session from, so no screen imports the auth SDK
 * just to find out who is signed in.
 */
export type AppRole = "user" | "admin";

export type AuthState = {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSignedIn: boolean;
  /** True until the first `onAuthStateChanged` fires — routing must wait. */
  isLoading: boolean;
  role: AppRole;
};

const SIGNED_OUT: Omit<AuthState, "isLoading"> = {
  userId: null,
  email: null,
  displayName: null,
  photoURL: null,
  isSignedIn: false,
  role: "user",
};

const store = createStore<AuthState>({ ...SIGNED_OUT, isLoading: true });

export const authStore = {
  useStore: store.useStore,
  getState: store.getState,
  subscribe: store.subscribe,
  setSession: (session: Partial<AuthState>) => store.setState(session),
  clear: () => store.setState({ ...SIGNED_OUT, isLoading: false }),
};

export default authStore;
