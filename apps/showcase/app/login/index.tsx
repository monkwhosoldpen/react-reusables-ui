import React, { useCallback } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/lib/contexts/AuthContext';
import LoginCommon from '~/components/common/LoginCommon';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { cn } from '~/lib/utils';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInAnonymously, signInAsGuest, refreshUserInfo } = useAuth();
  const { colorScheme, isDarkMode } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Apply design system tokens
  const containerStyle = {
    ...styles.container,
    backgroundColor: colorScheme.colors.background,
    paddingBottom: insets.bottom + Number(design.spacing.padding.card),
    paddingTop: insets.top + Number(design.spacing.padding.card),
  };

  const sectionStyle: ViewStyle = {
    ...styles.section,
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center' as const,
    shadowColor: colorScheme.colors.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: Number(design.spacing.margin.card),
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.xl),
    fontWeight: '700',
    marginBottom: Number(design.spacing.margin.card),
    textAlign: 'center',
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.replace('/(tabs)');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.replace('/(tabs)');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshUserInfo();
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to sign in as guest');
      console.error('Guest sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = useCallback(() => (
    <Animated.View style={[sectionStyle, { opacity: fadeAnim }]}>
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
        onCancel={() => router.back()}
      />
    </Animated.View>
  ), [email, password, error, isLoading, fadeAnim, sectionStyle]);

  return (
    <View style={containerStyle}>
      <FlashList
        data={[1]}
        renderItem={renderItem}
        estimatedItemSize={400}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
    borderWidth: 0,
  },
}); 