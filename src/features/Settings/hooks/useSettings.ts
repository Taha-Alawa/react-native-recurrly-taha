import { useCallback, useState } from "react";
import { usePostHog } from "posthog-react-native";
import useLanguageSwitcher from "@/core/hooks/useLanguageSwitcher";
import authStore from "@/core/store/authStore";
import dialogStore from "@/core/store/dialogStore";
import { UPDATE_PROFILE_DIALOG } from "@/features/Settings/hooks/Profile/useProfileDialog";
import { getDisplayName } from "@/core/utils/formatters";
import { LANGUAGE_NAMES } from "@/core/i18n/languages";
import AuthService from "@/features/Auth/services/AuthService";
import subscriptionCache from "@/features/Subscriptions/hooks/Subscription/subscriptionCache";

export const useSettings = () => {
  const user = authStore.useStore();
  const posthog = usePostHog();
  const { currentLanguage } = useLanguageSwitcher();

  const [signingOut, setSigningOut] = useState(false);
  const [isLanguageDialogOpen, setLanguageDialogOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      // Drop the cached collection so the next user never sees the last one's.
      subscriptionCache.reset();
      await AuthService.signOut();
    } finally {
      setSigningOut(false);
    }
  }, [posthog, signingOut]);

  const openProfileDialog = useCallback(() => {
    dialogStore.open(UPDATE_PROFILE_DIALOG, "update");
  }, []);

  return {
    displayName: getDisplayName(user),
    /** Empty until the user sets one — the row shows a prompt instead. */
    username: user.displayName,
    email: user.email ?? "",
    avatarUri: user.photoURL,
    languageLabel: LANGUAGE_NAMES[currentLanguage],
    openProfileDialog,
    signingOut,
    handleSignOut,
    isLanguageDialogOpen,
    openLanguageDialog: () => setLanguageDialogOpen(true),
    closeLanguageDialog: () => setLanguageDialogOpen(false),
  };
};

export default useSettings;
