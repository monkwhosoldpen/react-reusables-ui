import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Animated, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';
  const inputBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#F8FAFC';
  const inputBorderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0';

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
      color: '#1E293B',
    },
    settingDescription: {
      fontSize: 16,
      color: '#64748B',
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

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInAnonymously();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInAsGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorScheme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>
                L
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>
                Welcome Back
              </Text>
              <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                Sign in to continue
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, backgroundColor: colorScheme.colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              Sign In
            </Text>
            <Text style={[styles.settingDescription, { color: subtitleColor }]}>
              Enter your credentials to access your account
            </Text>

            <TextInput
              style={[styles.input, { color: colorScheme.colors.text }]}
              placeholder="Email"
              placeholderTextColor={subtitleColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { color: colorScheme.colors.text }]}
              placeholder="Password"
              placeholderTextColor={subtitleColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="login" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleAnonymousSignIn}
              disabled={isLoading}
            >
              <MaterialIcons name="person-outline" size={20} color={colorScheme.colors.text} />
              <Text style={styles.socialButtonText}>Continue as Anonymous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={handleGuestSignIn}
              disabled={isLoading}
            >
              <MaterialIcons name="person" size={20} color={colorScheme.colors.text} />
              <Text style={styles.socialButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
} 