import React, { useState } from 'react';
import { I18nManager, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from '@clerk/clerk-expo';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import images from '@/constants/images';
import { getDisplayName } from '@/lib/utils';
import { usePostHog } from 'posthog-react-native';
import { useLanguageSwitcher } from '@/hooks/useLanguageSwitcher';
import LanguagePickerModal from '@/components/LanguagePickerModal';
import { LANGUAGE_NAMES } from '@/lib/i18n';
const SafeAreaView = styled(RNSafeAreaView)

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useAuth();
  const posthog = usePostHog();
  const { currentLanguage } = useLanguageSwitcher();
  const [signingOut, setSigningOut] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const onSignOutPress = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-user">
        <Image
          source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
          className="home-avatar"
        />
        <View className="ml-4">
          <Text className="home-user-name">{getDisplayName(user)}</Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      <View className="settings-section">
        <Pressable
          className="settings-row"
          onPress={() => setLanguageModalVisible(true)}
        >
          <Text className="settings-row-label">{t('settings.language')}</Text>
          <View className="settings-row-value-group">
            <Text className="settings-row-value">
              {LANGUAGE_NAMES[currentLanguage]}
            </Text>
            <Text className="settings-row-chevron">
              {I18nManager.isRTL ? '‹' : '›'}
            </Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        className={clsx('sub-cancel mt-8', signingOut && 'sub-cancel-disabled')}
        onPress={onSignOutPress}
        disabled={signingOut}
      >
        <Text className="sub-cancel-text">
          {signingOut ? t('settings.signingOut') : t('settings.signOut')}
        </Text>
      </Pressable>

      <LanguagePickerModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default Settings;
