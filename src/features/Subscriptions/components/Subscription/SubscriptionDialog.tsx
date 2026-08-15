import DialogShell from "@/core/components/Dialog/DialogShell";
import useSubscriptionDialog from "@/features/Subscriptions/hooks/Subscription/useSubscriptionDialog";
import SubscriptionForm from "@/features/Subscriptions/components/Subscription/SubscriptionForm";

export type SubscriptionDialogProps = {
  onRefresh: () => void | Promise<void>;
};

/**
 * Shell + form + title selection (architecture §7.4). Holds no visibility state
 * of its own — `isOpen` is derived from the global dialog store.
 */
const SubscriptionDialog = ({ onRefresh }: SubscriptionDialogProps) => {
  const { isOpen, type, data, title, onSubmit, close } = useSubscriptionDialog({
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
      <SubscriptionForm
        data={data}
        onSubmit={onSubmit}
        readOnly={type === "read"}
      />
    </DialogShell>
  );
};

export default SubscriptionDialog;
