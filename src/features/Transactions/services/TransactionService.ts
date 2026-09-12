import { deleteDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import {
  authenticatedDb,
  request,
  type Result,
} from "@/core/services/firestoreClient";
import type {
  Transaction,
  TransactionDocument,
} from "@/features/Transactions/interfaces/Transaction.interface";
import {
  toTransaction,
  toTransactionDocument,
} from "@/features/Transactions/utils/transactionMappers";

const COLLECTION = "transactions";

/**
 * Endpoint definitions for the transaction resource (architecture §4.2).
 *
 * There is no `update`: a transaction records something that already happened,
 * so a wrong one is deleted and re-entered rather than rewritten. That also
 * keeps the derived balance honest — every change is an add or a remove.
 */
const TransactionService = {
  list: async (): Promise<Result<Transaction[]>> =>
    request(async () => {
      const snapshot = await getDocs(
        query(authenticatedDb.collection(COLLECTION), orderBy("date", "desc")),
      );

      return snapshot.docs.map((entry) =>
        toTransaction(entry.id, entry.data() as TransactionDocument),
      );
    }),

  create: async (transaction: Transaction): Promise<Result<Transaction>> =>
    request(async () => {
      await setDoc(
        authenticatedDb.doc(COLLECTION, transaction.id),
        toTransactionDocument(transaction),
      );
      return transaction;
    }),

  remove: async (id: string): Promise<Result<string>> =>
    request(async () => {
      await deleteDoc(authenticatedDb.doc(COLLECTION, id));
      return id;
    }),
};

export default TransactionService;
