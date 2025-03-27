import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import type { 
  Notification, 
  NotificationResponse
} from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {

        // Skip setup for web platform if not supported
        if (Platform.OS === 'web' && !('Notification' in window)) {
          return;
        }

        // Check and request permissions based on platform
        let hasPermission = false;

        if (Platform.OS === 'web') {
          // Web notification permissions
          const permission = await window.Notification.requestPermission();
          hasPermission = permission === 'granted';
        } else {
          // Native permissions
          const settings = await Notifications.getPermissionsAsync();
          
          if (Platform.OS === 'ios') {
            hasPermission = settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
                           settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
          } else {
            // Android permissions
            hasPermission = true; // Android permissions are granted by default
          }

          // Request permissions if not granted
          if (!hasPermission) {
            const permissionResponse = await Notifications.requestPermissionsAsync({
              ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowDisplayInCarPlay: true,
                allowCriticalAlerts: true,
                provideAppNotificationSettings: true,
              },
            });

            if (Platform.OS === 'ios') {
              hasPermission = permissionResponse.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
                             permissionResponse.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
            } else {
              // Android permissions response
              hasPermission = true; // Android permissions are granted by default
            }
          }

          // Set up Android channel
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }
        }

        if (!hasPermission) {
          return;
        }

        // Add notification listeners for native platforms
        if (Platform.OS !== 'web') {
          // Add notification listeners
          const notificationListener = Notifications.addNotificationReceivedListener(
            (notification: Notification) => {
            }
          );

          const responseListener = Notifications.addNotificationResponseReceivedListener(
            (response: NotificationResponse) => {
            }
          );

          // Get push token for native platforms
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });

          // Cleanup function for native listeners
          return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
          };
        } else {
          // Web notification listener
          const webNotificationListener = (event: Event) => {
          };
          
          // Add web notification listener
          window.addEventListener('notification', webNotificationListener);
          
          // Cleanup function for web listener
          return () => {
            window.removeEventListener('notification', webNotificationListener);
          };
        }

      } catch (error) {
      }
    };

    initializeNotifications();
  }, []);

  return <>{children}</>;
} 