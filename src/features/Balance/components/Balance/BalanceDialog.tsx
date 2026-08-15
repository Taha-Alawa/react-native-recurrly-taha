import DialogShell from "@/core/components/Dialog/DialogShell";
import useBalanceDialog from "@/features/Balance/hooks/Balance/useBalanceDialog";
import BalanceForm from "@/features/Balance/components/Balance/BalanceForm";

export type BalanceDialogProps = {
  onRefresh: () => void | Promise<void>;
};

const BalanceDialog = ({ onRefresh }: BalanceDialogProps) => {
  const { isOpen, currentAmount, title, onSubmit, close } = useBalanceDialog({
    onRefresh,
  });

  return (
    <DialogShell visible={isOpen} title={title} onClose={close} avoidKeyboard>
      <BalanceForm currentAmount={currentAmount} onSubmit={onSubmit} />
    </DialogShell>
  );
};

export default BalanceDialog;
