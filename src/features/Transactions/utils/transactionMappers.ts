import { resolveIcon } from "@/features/Subscriptions/utils/subscriptionMappers";
import type {
  Transaction,
  TransactionDocument,
} from "@/features/Transactions/interfaces/Transaction.interface";

/** Server document -> UI entity. */
export const toTransaction = (
  id: string,
  document: TransactionDocument,
): Transaction => ({
  ...document,
  id,
  icon: resolveIcon(document.iconKey),
});

/** UI entity -> server document. Strips everything Firestore cannot store. */
export const toTransactionDocument = (
  transaction: Transaction,
): TransactionDocument => {
  const { id, icon, ...document } = transaction;
  void id;
  void icon;

  // Firestore rejects `undefined`; omit those keys entirely.
  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  ) as unknown as TransactionDocument;
};
