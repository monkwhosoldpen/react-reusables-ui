import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { MaterialIcons } from "@expo/vector-icons";
import LoginCommon from '@/components/common/LoginCommon';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function LoginPage() {
  const { signIn, signInAnonymously, signInAsGuest, user } = useAuth();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    content: {
      flex: 1,
      marginBottom: 20,
      marginTop: 20,
      padding: Number(design.spacing.padding.card),
    },
    header: {
      marginBottom: Number(design.spacing.padding.card),
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colorScheme.colors.text,
      opacity: 0.7,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: `${colorScheme.colors.primary}1A`,
    },
    title: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '700',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item),
    },
    description: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: 0.7,
      lineHeight: 24,
    },
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInAnonymously();
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInAsGuest();
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

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
          onCancel={() => {}}
        />
      </View>
    </SafeAreaView>
  );
} 