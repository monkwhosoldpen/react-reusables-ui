'use client';

import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { ActivityIndicator } from 'react-native';
import { Card } from '~/components/ui/card';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';

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
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card) * 1.5,
      width: '100%',
      maxWidth: 400,
      maxHeight: '90%',
      ...Platform.select({
        ios: {
          shadowColor: colorScheme.colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: Number(design.spacing.padding.card) * 1.5,
    },
    title: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '700',
      color: colorScheme.colors.primary,
      marginBottom: Number(design.spacing.padding.item),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: Number(design.spacing.fontSize.base) * 1.5,
    },
    formGroup: {
      marginBottom: Number(design.spacing.padding.card),
    },
    label: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item) / 2,
    },
    input: {
      backgroundColor: colorScheme.colors.background,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.md),
      padding: Number(design.spacing.padding.item),
      ...Platform.select({
        ios: {
          shadowColor: colorScheme.colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    error: {
      color: colorScheme.colors.notification,
      fontSize: Number(design.spacing.fontSize.base),
      marginTop: Number(design.spacing.padding.item) / 2,
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Number(design.spacing.padding.card),
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colorScheme.colors.border,
    },
    dividerText: {
      marginHorizontal: Number(design.spacing.padding.item),
      color: colorScheme.colors.text,
      opacity: 0.5,
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '500',
    },
    button: {
      marginBottom: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.md),
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colorScheme.colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Number(design.spacing.padding.item),
    },
    buttonText: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600',
    },
  });

  return (
    <Card style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your email to sign in to your account</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <Input
            placeholder="m@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <Input
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Button 
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={[styles.buttonText, { color: 'white', marginLeft: 8 }]}>
                  Signing in...
                </Text>
              </>
            ) : (
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Sign in with Email
              </Text>
            )}
          </View>
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button 
          onPress={handleAnonymousSignIn}
          disabled={isLoading}
          variant="outline"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={colorScheme.colors.text} />
                <Text style={[styles.buttonText, { color: colorScheme.colors.text, marginLeft: 8 }]}>
                  Signing in...
                </Text>
              </>
            ) : (
              <Text style={[styles.buttonText, { color: colorScheme.colors.text }]}>
                Continue Anonymously
              </Text>
            )}
          </View>
        </Button>

        <Button 
          onPress={handleGuestSignIn}
          disabled={isLoading}
          variant="outline"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={colorScheme.colors.text} />
                <Text style={[styles.buttonText, { color: colorScheme.colors.text, marginLeft: 8 }]}>
                  Signing in...
                </Text>
              </>
            ) : (
              <Text style={[styles.buttonText, { color: colorScheme.colors.text }]}>
                Continue as Guest
              </Text>
            )}
          </View>
        </Button>

        <Button 
          variant="ghost" 
          onPress={onCancel}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: colorScheme.colors.text, opacity: 0.7 }]}>
              Cancel
            </Text>
          </View>
        </Button>
      </ScrollView>
    </Card>
  );
}
