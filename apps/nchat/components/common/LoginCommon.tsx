'use client';

import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { ActivityIndicator } from 'react-native';

export default function LoginCommon({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleSubmit,
  handleAnonymousSignIn,
  handleGuestSignIn,
  onCancel,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  isLoading: boolean;
  handleSubmit: () => void;
  handleAnonymousSignIn: () => void;
  handleGuestSignIn: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="p-4 space-y-4">
      <View className="space-y-3">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-background"
          editable={!isLoading}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-background"
          editable={!isLoading}
        />
        {error ? (
          <Text className="text-sm text-destructive px-1">{error}</Text>
        ) : null}
        <Button 
          onPress={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          <View className="flex-row items-center justify-center py-1">
            {isLoading ? (
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

      {/* Anonymous Sign In */}
      <Button 
        onPress={handleAnonymousSignIn}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <View className="flex-row items-center justify-center py-1">
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="currentColor" />
              <Text className="text-foreground ml-2 text-base">Signing in...</Text>
            </>
          ) : (
            <Text className="text-foreground text-base">Continue Anonymously</Text>
          )}
        </View>
      </Button>

      {/* Guest Sign In */}
      <Button 
        onPress={handleGuestSignIn}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <View className="flex-row items-center justify-center py-1">
          {isLoading ? (
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
        onPress={onCancel}
        className="w-full"
      >
        <Text className="text-muted-foreground text-base">Cancel</Text>
      </Button>
    </View>
  );
}
