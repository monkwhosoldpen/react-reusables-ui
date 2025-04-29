import { useAuth } from '@/lib/contexts/AuthContext';
import { MainScreen } from "~/components/home/main";
import { View, StyleSheet, ViewStyle, ActivityIndicator, Animated, Text, useWindowDimensions } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useState, useEffect } from 'react';
import { indexedDB } from '@/lib/services/indexedDB';
import React from 'react';
import { Landing } from '~/components/home/landing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktop = width >= 768;

  // Initialize IndexedDB and check cache
  useEffect(() => {
    const initialize = async () => {
      try {
        await indexedDB.initialize();
        setDbInitialized(true);
        
        const users = await indexedDB.getAllUsers();
        if (users.length > 0) {
          setCachedUser(users[0]);
        }
        
        if (user?.id) {
          const [follows, requests] = await Promise.all([
            indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
            indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id)
          ]);
          setUserData({ follows, requests });
          setDataLoaded(true);
        }
      } catch (error) {
        // Handle error silently
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
            setDataLoaded(false);
          }
        }
      } else {
        setCachedUser(null);
        setDataLoaded(false);
        setUserData(null);
      }
    };
    
    loadUserData();
  }, [user]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: insets.bottom + 20,
    },
    desktopContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    loadingCard: {
      padding: 24,
      borderRadius: 12,
      backgroundColor: theme.colorScheme.colors.card,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    loadingText: {
      marginTop: 16,
      color: theme.colorScheme.colors.text,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    loadingSubtext: {
      marginTop: 8,
      color: theme.colorScheme.colors.text,
      opacity: 0.7,
      fontSize: 16,
      textAlign: 'center',
    },
  });

  // Show blank screen until initialization is complete
  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={theme.colorScheme.colors.primary} />
          <Text style={styles.loadingText}>Initializing app...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we set things up</Text>
        </View>
      </View>
    );
  }

  // Show MainScreen if we have either a cached user or current user, and data is loaded
  if ((cachedUser || user) && dbInitialized && dataLoaded) {
    return <MainScreen initialData={userData} />;
  }

  // If no user and not loading, show landing
  if (!loading) {
    return (
      <View style={styles.container}>
        <Landing />
      </View>
    );
  }

  // During loading with no cache, show a blank screen with app background
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={theme.colorScheme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.loadingSubtext}>Getting your data ready</Text>
      </View>
    </View>
  );
}
