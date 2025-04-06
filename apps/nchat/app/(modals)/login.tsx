import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { useAuth } from '~/lib/contexts/AuthContext';
import LoginCommon from '~/components/common/LoginCommon';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginModal() {
  const router = useRouter();
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      setTimeout(() => {
        router.dismiss();
      }, 1000);
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
      setTimeout(() => {
        router.dismiss();
      }, 1000);
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
      setTimeout(() => {
        router.dismiss();
      }, 1000);
    } catch (err) {
      setError('Failed to sign in as guest');
      console.error('Guest sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View 
      style={[
        styles.container,
        { 
          backgroundColor: colorScheme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }
      ]}
    >
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
}); 