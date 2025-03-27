import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { useLogin } from '~/lib/hooks/useLogin';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export function HeaderContent() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { showLogin } = useLogin();

  const handleProfilePress = () => {
    if (!isAuthenticated) {
      showLogin();
      return;
    }

    router.push('/profile');
  };

  return (
    <View className="flex-row items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onPress={handleProfilePress}
      >
        <Ionicons name="person" size={20} color={theme.colors.foreground} />
      </Button>
    </View>
  );
} 