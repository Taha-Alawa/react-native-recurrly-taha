import { getDoc, setDoc } from "firebase/firestore";
import {
  authenticatedDb,
  request,
  type Result,
} from "@/core/services/firestoreClient";
import type { BalanceDocument } from "@/features/Balance/interfaces/Balance.interface";

/**
 * The balance lives as a field on the user document rather than in its own
 * collection — it is exactly one value per user, so a subcollection would buy
 * nothing but an extra read.
 *
 * A user who has never set a balance genuinely has zero; that is a real value
 * read from an absent document, not a placeholder.
 */
const BalanceService = {
  get: async (): Promise<Result<number>> =>
    request(async () => {
      const snapshot = await getDoc(authenticatedDb.userDoc());
      if (!snapshot.exists()) return 0;

      const { balance } = snapshot.data() as BalanceDocument;
      return typeof balance === "number" ? balance : 0;
    }),

  set: async (amount: number): Promise<Result<number>> =>
    request(async () => {
      await setDoc(
        authenticatedDb.userDoc(),
        { balance: amount, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      return amount;
    }),
};

export default BalanceService;
