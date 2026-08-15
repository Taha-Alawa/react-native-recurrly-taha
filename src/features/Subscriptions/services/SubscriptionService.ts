import {
  deleteDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  authenticatedDb,
  request,
  type Result,
} from "@/core/services/firestoreClient";
import type {
  Subscription,
  SubscriptionDocument,
} from "@/features/Subscriptions/interfaces/Subscription.interface";
import {
  toSubscription,
  toSubscriptionDocument,
} from "@/features/Subscriptions/utils/subscriptionMappers";

const COLLECTION = "subscriptions";

/**
 * Endpoint definitions for the subscription resource (architecture §4.2).
 * One-liners naming a backend operation — no state, no UI, no try/catch: the
 * Firestore wrapper owns all of that.
 *
 * Firestore is the only source of truth. There is no local fallback: a read
 * that fails surfaces as an error rather than as invented data.
 */
const SubscriptionService = {
  list: async (): Promise<Result<Subscription[]>> =>
    request(async () => {
      const snapshot = await getDocs(
        query(
          authenticatedDb.collection(COLLECTION),
          orderBy("startDate", "desc"),
        ),
      );

      return snapshot.docs.map((entry) =>
        toSubscription(entry.id, entry.data() as SubscriptionDocument),
      );
    }),

  create: async (subscription: Subscription): Promise<Result<Subscription>> =>
    request(async () => {
      await setDoc(
        authenticatedDb.doc(COLLECTION, subscription.id),
        toSubscriptionDocument(subscription),
      );
      return subscription;
    }),

  update: async (subscription: Subscription): Promise<Result<Subscription>> =>
    request(async () => {
      await setDoc(
        authenticatedDb.doc(COLLECTION, subscription.id),
        toSubscriptionDocument(subscription),
        { merge: true },
      );
      return subscription;
    }),

  cancel: async (id: string): Promise<Result<string>> =>
    request(async () => {
      await updateDoc(authenticatedDb.doc(COLLECTION, id), {
        status: "cancelled",
      });
      return id;
    }),

  remove: async (id: string): Promise<Result<string>> =>
    request(async () => {
      await deleteDoc(authenticatedDb.doc(COLLECTION, id));
      return id;
    }),
};

export default SubscriptionService;
