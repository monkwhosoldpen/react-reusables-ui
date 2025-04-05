import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { useAuth } from '~/lib/contexts/AuthContext';
import LoginCommon from '~/components/common/LoginCommon';

export default function LoginModal() {
  const router = useRouter();
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
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
    <View className="flex-1 justify-center items-center p-4 bg-background/50">
      <Card className="w-full max-w-sm overflow-hidden">
        {/* Header with themed background */}
        <View className="bg-primary p-4">
          <Text className="text-primary-foreground text-xl font-semibold">Welcome back</Text>
          <Text className="text-primary-foreground/80 text-sm mt-1">
            Sign in to continue to Goats Connect
          </Text>
        </View>

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
      </Card>
    </View>
  );
} 