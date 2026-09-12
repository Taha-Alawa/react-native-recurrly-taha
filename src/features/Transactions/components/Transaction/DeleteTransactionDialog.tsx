import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/core/components/Dialog/ConfirmDialog";
import useDialog from "@/core/hooks/useDialog";
import {
  DELETE_TRANSACTION_DIALOG,
  type DeleteTransactionPayload,
} from "@/features/Transactions/hooks/Transaction/useTransactions";
import type { Transaction } from "@/features/Transactions/interfaces/Transaction.interface";

export type DeleteTransactionDialogProps = {
  onConfirm: (transaction: Transaction) => void | Promise<void>;
};

/**
 * Deleting matters more here than elsewhere: the balance is the sum of these
 * rows, so a mistyped amount stays wrong until the row goes. Hence a confirm
 * sheet rather than a silent swipe.
 */
const DeleteTransactionDialog = ({ onConfirm }: DeleteTransactionDialogProps) => {
  const { t } = useTranslation();
  const { isOpen, payload, close } = useDialog<DeleteTransactionPayload>(
    DELETE_TRANSACTION_DIALOG,
  );

  const transaction = payload?.data ?? null;

  return (
    <ConfirmDialog
      visible={isOpen}
      title={t("transactions.deleteTitle", "Delete Transaction")}
      message={t("transactions.deleteConfirm", {
        name: transaction?.name ?? "",
        defaultValue:
          "Delete {{name}}? Your balance will be recalculated without it.",
      })}
      glyph="!"
      tone="danger"
      disabled={payload?.disabled ?? false}
      confirmLabel={t("transactions.delete", "Delete")}
      cancelLabel={t("common.keep", "Keep it")}
      onConfirm={() => transaction && onConfirm(transaction)}
      onClose={close}
    />
  );
};

export default DeleteTransactionDialog;
