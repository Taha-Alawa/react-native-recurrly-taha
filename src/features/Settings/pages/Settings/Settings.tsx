import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import images from "@/core/constants/images";
import LanguageDialog from "@/core/components/Localization/LanguageDialog";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";
import useSettings from "@/features/Settings/hooks/useSettings";
import ProfileDialog from "@/features/Settings/components/Profile/ProfileDialog";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { t } = useTranslation();
  const direction = useDirection();
  const {
    displayName,
    username,
    email,
    avatarUri,
    languageLabel,
    signingOut,
    handleSignOut,
    openProfileDialog,
    isLanguageDialogOpen,
    openLanguageDialog,
    closeLanguageDialog,
  } = useSettings();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Pressable
        className="home-user"
        onPress={openProfileDialog}
        accessibilityRole="button"
        accessibilityLabel={t("settings.editProfile", "Edit profile")}
      >
        <Image
          source={avatarUri ? { uri: avatarUri } : images.avatar}
          className="home-avatar"
        />
        <View className="ml-4 min-w-0 flex-1">
          <Text className="home-user-name" numberOfLines={1}>
            {displayName}
          </Text>
          <Text
            className="text-sm font-sans-medium text-muted-foreground"
            numberOfLines={1}
          >
            {email}
          </Text>
        </View>
        <Text className="settings-row-chevron">{direction.forwardGlyph}</Text>
      </Pressable>

      <View className="settings-section">
        <Pressable className="settings-row" onPress={openProfileDialog}>
          <Text className="settings-row-label">
            {t("settings.profile", "Profile")}
          </Text>
          <View className="settings-row-value-group">
            <Text className="settings-row-value" numberOfLines={1}>
              {username || t("settings.addUsername", "Add a username")}
            </Text>
            <Text className="settings-row-chevron">
              {direction.forwardGlyph}
            </Text>
          </View>
        </Pressable>

        <Pressable className="settings-row" onPress={openLanguageDialog}>
          <Text className="settings-row-label">
            {t("settings.language", "Language")}
          </Text>
          <View className="settings-row-value-group">
            <Text className="settings-row-value">{languageLabel}</Text>
            <Text className="settings-row-chevron">
              {direction.forwardGlyph}
            </Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        className={clsx("sub-cancel mt-8", signingOut && "sub-cancel-disabled")}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Text className="sub-cancel-text">
          {signingOut
            ? t("settings.signingOut", "Signing out…")
            : t("settings.signOut", "Sign out")}
        </Text>
      </Pressable>

      <ProfileDialog />
      <LanguageDialog
        visible={isLanguageDialogOpen}
        onClose={closeLanguageDialog}
      />
    </SafeAreaView>
  );
};

export default Settings;
