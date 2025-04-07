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
  const isDarkMode = useColorScheme().colorScheme.name === 'dark';
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = React.useState(false);
  const [isGuestLoading, setIsGuestLoading] = React.useState(false);

  const handleEmailSubmit = async () => {
    setIsEmailLoading(true);
    try {
      await handleSubmit();
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleAnonymousSubmit = async () => {
    setIsAnonymousLoading(true);
    try {
      await handleAnonymousSignIn();
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    setIsGuestLoading(true);
    try {
      await handleGuestSignIn();
    } finally {
      setIsGuestLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card) * 1.5,
      width: '100%' as const,
      ...Platform.select({
        ios: {
          shadowColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: isDarkMode ? 6 : 4,
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
      fontWeight: '700' as const,
      color: colorScheme.colors.primary,
      marginBottom: Number(design.spacing.padding.item),
      textAlign: 'center' as const,
    },
    subtitle: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: isDarkMode ? 0.8 : 0.7,
      textAlign: 'center' as const,
      lineHeight: Number(design.spacing.fontSize.base) * 1.5,
    },
    formGroup: {
      marginBottom: Number(design.spacing.padding.card),
    },
    label: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600' as const,
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item) / 2,
    },
    input: {
      backgroundColor: colorScheme.colors.background,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.md),
      padding: Number(design.spacing.padding.item),
      color: colorScheme.colors.text,
      ...Platform.select({
        ios: {
          shadowColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDarkMode ? 0.2 : 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: isDarkMode ? 2 : 1,
        },
      }),
    },
    error: {
      color: colorScheme.colors.notification,
      fontSize: Number(design.spacing.fontSize.base),
      marginTop: Number(design.spacing.padding.item) / 2,
      textAlign: 'center' as const,
    },
    divider: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
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
      opacity: isDarkMode ? 0.6 : 0.5,
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '500' as const,
    },
    button: {
      marginBottom: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.md),
      overflow: 'hidden' as const,
      ...Platform.select({
        ios: {
          shadowColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.2 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: isDarkMode ? 3 : 2,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: Number(design.spacing.padding.item),
    },
    buttonText: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600' as const,
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
            editable={!isEmailLoading}
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
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
            editable={!isEmailLoading}
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
          />
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Button 
          onPress={handleEmailSubmit}
          disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isEmailLoading ? (
              <>
                <ActivityIndicator size="small" color={colorScheme.colors.text} />
                <Text style={[styles.buttonText, { color: colorScheme.colors.text, marginLeft: 8 }]}>
                  Signing in...
                </Text>
              </>
            ) : (
              <Text style={[styles.buttonText, { color: colorScheme.colors.text }]}>
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
          onPress={handleAnonymousSubmit}
          disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
          variant="outline"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isAnonymousLoading ? (
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
          onPress={handleGuestSubmit}
          disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
          variant="outline"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            {isGuestLoading ? (
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
            <Text style={[styles.buttonText, { color: colorScheme.colors.text, opacity: isDarkMode ? 0.8 : 0.7 }]}>
              Cancel
            </Text>
          </View>
        </Button>
      </ScrollView>
    </Card>
  );
}
