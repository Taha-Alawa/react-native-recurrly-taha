import DialogShell from "@/core/components/Dialog/DialogShell";
import useTransactionDialog from "@/features/Transactions/hooks/Transaction/useTransactionDialog";
import TransactionForm from "@/features/Transactions/components/Transaction/TransactionForm";

export type TransactionDialogProps = {
  onRefresh: () => void | Promise<void>;
};

/**
 * Shell + form + title selection (architecture §7.4). Holds no visibility state
 * of its own — `isOpen` is derived from the global dialog store.
 */
const TransactionDialog = ({ onRefresh }: TransactionDialogProps) => {
  const { isOpen, initialType, title, onSubmit, close } = useTransactionDialog({
    onRefresh,
  });

  return (
    <DialogShell
      visible={isOpen}
      title={title}
      onClose={close}
      scrollable
      avoidKeyboard
    >
      <TransactionForm
        isOpen={isOpen}
        initialType={initialType}
        onSubmit={onSubmit}
      />
    </DialogShell>
  );
};

export default TransactionDialog;
