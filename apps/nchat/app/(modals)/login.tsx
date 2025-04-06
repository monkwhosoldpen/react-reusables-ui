import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/contexts/AuthContext';
import LoginCommon from '~/components/common/LoginCommon';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';

export default function LoginModal() {
  const router = useRouter();
  const { signIn, signInAnonymously, signInAsGuest, refreshUserInfo } = useAuth();
  const { colorScheme, isDarkMode } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Apply design system tokens
  const sectionStyle = {
    ...styles.section,
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
    maxWidth: 400,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.xl),
    fontWeight: '700' as const,
    marginBottom: Number(design.spacing.margin.card),
    textAlign: 'center' as const,
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.dismiss();
    } catch (err) {
      setError('Invalid email or password');
      console.error('Email sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAnonymously();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.dismiss();
    } catch (err) {
      setError('Failed to sign in anonymously');
      console.error('Anonymous sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAsGuest();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.dismiss();
    } catch (err) {
      setError('Failed to sign in as guest');
      console.error('Guest sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: insets.bottom + Number(design.spacing.padding.card),
          paddingTop: insets.top + Number(design.spacing.padding.card),
        }
      ]}
    >
      <View style={sectionStyle}>
        <LoginCommon
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleAnonymousSignIn={handleAnonymousSignIn}
          handleGuestSignIn={handleGuestSignIn}
          onCancel={() => router.dismiss()}
          isDarkMode={isDarkMode}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
}); 