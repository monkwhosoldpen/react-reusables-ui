import React from 'react';
import { View, ActivityIndicator, TextInput } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { useAuth } from '~/lib/providers/auth/AuthProvider';

type SignInModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { loginAsGuest, loginWithCredentials } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await loginAsGuest();
      onOpenChange(false);
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
      await loginWithCredentials(email, password);
      onOpenChange(false);
    } catch (err) {
      setError('Invalid email or password');
      console.error('Email sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background p-0 overflow-hidden">
        {/* Header with WhatsApp-style green background */}
        <View className="bg-[#128C7E] p-4">
          <DialogHeader>
            <DialogTitle>
              <Text className="text-white text-xl font-semibold">Welcome back</Text>
            </DialogTitle>
            <Text className="text-white/80 text-sm mt-1">
              Sign in to continue to Goats Connect
            </Text>
          </DialogHeader>
        </View>

        <View className="p-4 space-y-4">
          {/* Email/Password Form */}
          <View className="space-y-3">
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md bg-white text-base"
              placeholderTextColor="#9E9E9E"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md bg-white text-base"
              placeholderTextColor="#9E9E9E"
            />
            {error ? (
              <Text className="text-sm text-red-500 px-1">{error}</Text>
            ) : null}
            <Button 
              onPress={handleEmailSignIn}
              disabled={loading}
              className="w-full bg-[#128C7E] hover:bg-[#075E54]"
            >
              <View className="flex-row items-center justify-center py-1">
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white ml-2 text-base">Signing in...</Text>
                  </>
                ) : (
                  <Text className="text-white text-base">Sign in with Email</Text>
                )}
              </View>
            </Button>
          </View>

          {/* Divider */}
          <View className="flex-row items-center py-2">
            <View className="flex-1 h-[1px] bg-[#E0E0E0]" />
            <Text className="mx-4 text-[#9E9E9E]">or</Text>
            <View className="flex-1 h-[1px] bg-[#E0E0E0]" />
          </View>

          {/* Guest Sign In */}
          <Button 
            onPress={handleGuestSignIn}
            disabled={loading}
            variant="outline"
            className="w-full border-[#128C7E]"
          >
            <View className="flex-row items-center justify-center py-1">
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#128C7E" />
                  <Text className="text-[#128C7E] ml-2 text-base">Signing in...</Text>
                </>
              ) : (
                <Text className="text-[#128C7E] text-base">Continue as Guest</Text>
              )}
            </View>
          </Button>

          {/* Cancel button */}
          <Button 
            variant="ghost" 
            onPress={() => onOpenChange(false)}
            className="w-full"
          >
            <Text className="text-[#9E9E9E] text-base">Cancel</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
} 