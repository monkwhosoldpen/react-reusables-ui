import React, { useEffect, useState } from 'react';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { useInAppDB } from '~/lib/core/providers/InAppDBProvider';
import { MainScreen } from "~/components/home/main";
import { View, ActivityIndicator, Text } from 'react-native';
import { Landing } from '~/components/home/landing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { DashboardScreen } from '~/components/dashboard/dashboard-screen';

export default function DashboardRoute({ username }: { username: string }) {
  const { user, loading } = useAuth();
  const inappDb = useInAppDB();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const [selectedChannel, setSelectedChannel] = React.useState(username);

  // Update selected channel when URL params change
  React.useEffect(() => {
    if (params.username && params.username !== selectedChannel) {
      setSelectedChannel(params.username as string);
    }
  }, [params.username]);

  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;

        const [follows, requests] = await Promise.all([
          inappDb.getUserChannelFollow(user.id),
          inappDb.getTenantRequests(user.id)
        ]);

        setUserData({ follows, requests });
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setInitialized(true);
      }
    };

    loadData();
  }, [user?.id, inappDb]);

  // Update cached user and load data when auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setCachedUser(user);
        if (user.id) {
          try {
            const [follows, requests] = await Promise.all([
              inappDb.getUserChannelFollow(user.id),
              inappDb.getTenantRequests(user.id)
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

  // Show blank screen until initialization is complete
  if (!initialized) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
        <View className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <ActivityIndicator size="large" className="text-blue-500" />
          <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
            Initializing app...
          </Text>
          <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
            Please wait while we set things up
          </Text>
        </View>
      </View>
    );
  }

  // Show MainScreen if we have either a cached user or current user, and data is loaded
  if ((cachedUser || user) && dataLoaded) {
    return <View className="flex-1 flex-row">
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1">
          <DashboardScreen username={selectedChannel as string} tabname={'overview'} />
        </View>
      </View>
    </View>
  }

  // If no user and not loading, show landing
  if (!loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Text>Hello, LOGIN REQUIRED</Text>
        <Button onPress={() => router.push('/login')}><Text>Login</Text></Button>
      </View>
    );
  }

  // During loading with no cache, show a blank screen with app background
  return (
    <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
      <View className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        <ActivityIndicator size="large" className="text-blue-500" />
        <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Loading...
        </Text>
        <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
          Getting your data ready
        </Text>
      </View>
    </View>
  );
}
