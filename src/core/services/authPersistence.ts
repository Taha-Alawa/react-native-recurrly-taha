import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import * as firebaseAuthModule from "firebase/auth";
import { browserLocalPersistence, type Persistence } from "firebase/auth";

/**
 * Resolves the right auth persistence for the current platform.
 *
 * `getReactNativePersistence` is real but untyped from this entry point:
 * `firebase/auth` is a thin `export * from '@firebase/auth'`, and that package
 * only exposes the function through its `react-native` export condition. Metro
 * picks that condition at runtime; TypeScript resolves the `types` condition,
 * which omits it. Hence the narrow cast below rather than a blanket
 * `@ts-expect-error` that would also discard the signature.
 *
 * Falls back to undefined (memory persistence) if the function ever disappears,
 * so an SDK upgrade degrades to "signs out on restart" instead of a crash.
 */
type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type ReactNativePersistenceFactory = (
  storage: AsyncStorageLike,
) => Persistence;

export const resolveAuthPersistence = (): Persistence | undefined => {
  if (Platform.OS === "web") return browserLocalPersistence;

  const getReactNativePersistence = (
    firebaseAuthModule as unknown as {
      getReactNativePersistence?: ReactNativePersistenceFactory;
    }
  ).getReactNativePersistence;

  if (!getReactNativePersistence) {
    if (__DEV__) {
      console.warn(
        "[firebase] getReactNativePersistence unavailable — the session will not " +
          "survive an app restart.",
      );
    }
    return undefined;
  }

  return getReactNativePersistence(ReactNativeAsyncStorage as AsyncStorageLike);
};
