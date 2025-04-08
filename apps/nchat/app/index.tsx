import { useAuth } from '@/lib/contexts/AuthContext';
import LoginCommon from '@/components/common/LoginCommon';
import { MainScreen } from "~/components/main";
import { View } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useState, useEffect } from 'react';
import { indexedDB } from '@/lib/services/indexedDB';

function LoginWrapper() {
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInAnonymously();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInAsGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}

export default function Index() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Initialize IndexedDB and check cache
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize IndexedDB first
        await indexedDB.initialize();
        setDbInitialized(true);

        // Then check for cached user
        const users = await indexedDB.getAllUsers();
        if (users.length > 0) {
          setCachedUser(users[0]);
        }

        // If we have a user, preload their data
        if (user?.id) {
          const [follows, requests] = await Promise.all([
            indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
            indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id)
          ]);
          setUserData({ follows, requests });
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  }, [user?.id]);

  // Update cached user and load data when auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setCachedUser(user);
        if (user.id) {
          try {
            const [follows, requests] = await Promise.all([
              indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
              indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id)
            ]);
            setUserData({ follows, requests });
            setDataLoaded(true);
          } catch (error) {
            console.error('Error loading user data:', error);
            setDataLoaded(false);
          }
        }
      } else {
        // Clear cached user and data when user logs out
        setCachedUser(null);
        setDataLoaded(false);
        setUserData(null);
      }
    };

    loadUserData();
  }, [user]);

  // Show blank screen until initialization is complete
  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colorScheme.colors.background }} />
    );
  }

  // Show MainScreen if we have either a cached user or current user, and data is loaded
  if ((cachedUser || user) && dbInitialized && dataLoaded) {
    return <MainScreen initialData={userData} />;
  }

  // If no user and not loading, show login
  if (!loading) {
    return <LoginWrapper />;
  }

  // During loading with no cache, show a blank screen with app background
  return (
    <View style={{ flex: 1, backgroundColor: theme.colorScheme.colors.background }} />
  );
}
