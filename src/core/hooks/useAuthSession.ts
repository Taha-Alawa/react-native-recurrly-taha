import { useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/core/services/firebase";
import authStore from "@/core/store/authStore";
import { setActiveUserId } from "@/core/services/firestoreClient";

/**
 * The single subscription to Firebase's session, mounted once at the root.
 *
 * Publishes into `authStore` (for routing and UI) and into the Firestore
 * wrapper (for path scoping), so nothing else in the app touches the auth SDK
 * to answer "who is signed in".
 */
export const useAuthSession = () => {
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      // Nothing can sign in without config; stop blocking the router.
      authStore.clear();
      setActiveUserId(null);
      return;
    }

    const publish = (user: User | null) => {
      setActiveUserId(user?.uid ?? null);

      if (!user) {
        authStore.clear();
        return;
      }

      authStore.setSession({
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isSignedIn: true,
        isLoading: false,
        role: "user",
      });
    };

    return onAuthStateChanged(firebaseAuth, publish);
  }, []);

  return authStore.useStore();
};

export default useAuthSession;
