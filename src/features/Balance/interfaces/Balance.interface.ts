/** Server shape — the balance fields on the `users/{uid}` document. */
export interface BalanceDocument {
  balance: number;
  updatedAt?: string;
}

export interface Balance {
  amount: number;
  updatedAt?: string;
}
