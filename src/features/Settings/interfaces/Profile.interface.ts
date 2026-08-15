/**
 * The profile lives on the Firebase Auth user record, not in Firestore —
 * `displayName` and `photoURL` are first-class fields there, so duplicating
 * them into a document would mean two sources of truth to keep in sync.
 */
export interface Profile {
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

/** A locally-picked image, before it has been uploaded. */
export interface PickedImage {
  uri: string;
  mimeType?: string;
}
