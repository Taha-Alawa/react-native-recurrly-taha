import DialogShell from "@/core/components/Dialog/DialogShell";
import useProfileDialog from "@/features/Settings/hooks/Profile/useProfileDialog";
import ProfileForm from "@/features/Settings/components/Profile/ProfileForm";

const ProfileDialog = () => {
  const { isOpen, title, onSubmit, onRemoveAvatar, close } = useProfileDialog();

  return (
    <DialogShell
      visible={isOpen}
      title={title}
      onClose={close}
      scrollable
      avoidKeyboard
    >
      <ProfileForm onSubmit={onSubmit} onRemoveAvatar={onRemoveAvatar} />
    </DialogShell>
  );
};

export default ProfileDialog;
