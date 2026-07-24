import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from '@clerk/clerk-expo';
import clsx from 'clsx';
import images from '@/constants/images';
const SafeAreaView = styled(RNSafeAreaView)

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOutPress = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-user">
        <Image source={images.avatar} className="home-avatar" />
        <View className="ml-4">
          <Text className="home-user-name">
            {user?.firstName || 'Your account'}
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      <Pressable
        className={clsx('sub-cancel mt-8', signingOut && 'sub-cancel-disabled')}
        onPress={onSignOutPress}
        disabled={signingOut}
      >
        <Text className="sub-cancel-text">
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default Settings;
