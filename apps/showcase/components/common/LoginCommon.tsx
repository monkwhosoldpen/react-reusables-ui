'use client';

import React from 'react';
import { View, StyleSheet, Platform, ScrollView, Animated, SafeAreaView } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { ActivityIndicator } from 'react-native';
import { Card } from '~/components/ui/card';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = React.useState(false);
  const [isGuestLoading, setIsGuestLoading] = React.useState(false);

  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';
  const inputBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#F8FAFC';
  const inputBorderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0';

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
    },
    headerContent: {
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    itemSubtitle: {
      fontSize: 14,
      opacity: 0.8,
    },
    card: {
      padding: 20,
      borderRadius: 16,
      marginTop: 24,
      backgroundColor: colorScheme.colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
      color: colorScheme.colors.text,
    },
    settingDescription: {
      fontSize: 16,
      color: subtitleColor,
      marginBottom: 16,
      lineHeight: 24,
    },
    input: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 16,
      backgroundColor: inputBgColor,
      borderWidth: 1,
      borderColor: inputBorderColor,
      color: colorScheme.colors.text,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 12,
      backgroundColor: colorScheme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme.colors.border,
      marginVertical: 24,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 12,
      backgroundColor: inputBgColor,
      borderWidth: 1,
      borderColor: inputBorderColor,
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginLeft: 8,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 14,
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>

      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Sign In
            </Text>
            <Text style={styles.settingDescription}>
              Enter your credentials to access your account
            </Text>

            <Input
              placeholder="Email"
              placeholderTextColor={subtitleColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              editable={!isEmailLoading}
              accessibilityLabel="Email input"
            />

            <Input
              placeholder="Password"
              placeholderTextColor={subtitleColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              editable={!isEmailLoading}
              accessibilityLabel="Password input"
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              onPress={handleEmailSubmit}
              disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
              style={styles.button}
              accessibilityLabel="Sign in with email button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isEmailLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : null}
                <Text style={styles.buttonText}>
                  {isEmailLoading ? 'Signing in...' : 'Sign in with Email'}
                </Text>
              </View>
            </Button>

            <View style={styles.divider} />

            <Button
              onPress={handleAnonymousSubmit}
              disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
              style={styles.socialButton}
              accessibilityLabel="Continue anonymously button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isAnonymousLoading ? (
                  <ActivityIndicator size="small" color={colorScheme.colors.text} />
                ) : null}
                <Text style={styles.socialButtonText}>
                  {isAnonymousLoading ? 'Signing in...' : 'Continue Anonymously'}
                </Text>
              </View>
            </Button>

            <Button
              onPress={handleGuestSubmit}
              disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
              style={styles.socialButton}
              accessibilityLabel="Continue as guest button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isGuestLoading ? (
                  <ActivityIndicator size="small" color={colorScheme.colors.text} />
                ) : null}
                <Text style={styles.socialButtonText}>
                  {isGuestLoading ? 'Signing in...' : 'Continue as Guest'}
                </Text>
              </View>
            </Button>

            <Button
              onPress={() => {
                setEmail('monkwhosoldpen@gmail.com');
                setPassword('password');
                handleSubmit();
              }}
              disabled={isEmailLoading || isAnonymousLoading || isGuestLoading}
              style={[styles.socialButton, { marginTop: 12, backgroundColor: colorScheme.colors.primary }]}
              accessibilityLabel="Demo login button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isEmailLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : null}
                <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
                  {isEmailLoading ? 'Signing in...' : 'Demo Login'}
                </Text>
              </View>
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
