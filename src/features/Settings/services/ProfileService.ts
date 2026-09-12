import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { File } from "expo-file-system";
import { firebaseAuth, firebaseStorage } from "@/core/services/firebase";
import authStore from "@/core/store/authStore";

/**
 * Endpoint definitions for the profile (architecture §4.2).
 *
 * Errors are thrown rather than swallowed: the profile form renders failures
 * inline, the same way the auth screens do.
 */
const requireUser = () => {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error("You're signed out. Sign in again to continue.");
  return user;
};

/**
 * `onAuthStateChanged` does NOT fire for profile edits, so every mutation here
 * pushes the new values into the session store itself. Without this the header
 * and settings row would keep showing the old name until the next cold start.
 */
const publish = (displayName: string | null, photoURL: string | null) => {
  authStore.setSession({ displayName, photoURL });
};

const ProfileService = {
  updateDisplayName: async (displayName: string) => {
    const user = requireUser();
    const trimmed = displayName.trim();

    await updateProfile(user, { displayName: trimmed });
    publish(trimmed, user.photoURL);
    return trimmed;
  },

  /**
   * Uploads a locally-picked image and points the profile at it.
   *
   * One object per user (`avatars/{uid}`) rather than a new file per change, so
   * replacing an avatar overwrites rather than accumulating orphaned uploads
   * nothing will ever clean up.
   */
  uploadAvatar: async (uri: string) => {
    const user = requireUser();
    if (!firebaseStorage) {
      throw new Error(
        "Firebase Storage is not configured. Check EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.",
      );
    }

    // Since SDK 56 the global fetch is expo/fetch, which rejects file:// URIs
    // and whose Response.blob() throws on native. Reading the picked asset
    // through expo-file-system keeps local uploads working.
    const file = new File(uri);
    const bytes = await file.bytes();

    const storageRef = ref(firebaseStorage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, bytes, { contentType: file.type || "image/jpeg" });

    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL });
    publish(user.displayName, photoURL);

    return photoURL;
  },

  removeAvatar: async () => {
    const user = requireUser();
    await updateProfile(user, { photoURL: "" });
    publish(user.displayName, null);
  },
};

export default ProfileService;
