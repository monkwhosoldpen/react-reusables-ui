import React from 'react';
import { View, ActivityIndicator, TextInput } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { useUser } from '~/lib/providers/auth/AuthProvider';

export default function LoginModal() {
  const router = useRouter();
  const { signIn, signInAsGuest } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInAsGuest();
      router.dismiss();
    } catch (err) {
      setError('Failed to sign in as guest. Please try again.');
      console.error('Guest sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email, password);
      router.dismiss();
    } catch (err) {
      setError('Invalid email or password');
      console.error('Email sign in error:', err);
    } finally {
      setLoading(false);
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

        <View className="p-4 space-y-4">
          {/* Email/Password Form */}
          <View className="space-y-3">
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-background"
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-background"
            />
            {error ? (
              <Text className="text-sm text-destructive px-1">{error}</Text>
            ) : null}
            <Button 
              onPress={handleEmailSignIn}
              disabled={loading}
              className="w-full"
            >
              <View className="flex-row items-center justify-center py-1">
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-primary-foreground ml-2 text-base">Signing in...</Text>
                  </>
                ) : (
                  <Text className="text-primary-foreground text-base">Sign in with Email</Text>
                )}
              </View>
            </Button>
          </View>

          {/* Divider */}
          <View className="flex-row items-center py-2">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="mx-4 text-muted-foreground">or</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Guest Sign In */}
          <Button 
            onPress={handleGuestSignIn}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <View className="flex-row items-center justify-center py-1">
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="currentColor" />
                  <Text className="text-foreground ml-2 text-base">Signing in...</Text>
                </>
              ) : (
                <Text className="text-foreground text-base">Continue as Guest</Text>
              )}
            </View>
          </Button>

          {/* Cancel button */}
          <Button 
            variant="ghost" 
            onPress={() => router.dismiss()}
            className="w-full"
          >
            <Text className="text-muted-foreground text-base">Cancel</Text>
          </Button>
        </View>
      </Card>
    </View>
  );
} 