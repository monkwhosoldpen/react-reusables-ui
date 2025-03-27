import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatHeaderContent } from '~/components/ChatHeaderContent';
import { useRealtime } from '~/lib/providers/RealtimeProvider';
import { View, Text } from 'react-native';

export default function TabsLayout() {
  const { feedItems } = useRealtime();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="radio-button-on" size={size} color={color} />
              <View style={{
                position: 'absolute',
                right: -6,
                top: -3,
                backgroundColor: '#007AFF',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}>
                  {feedItems?.length || 0}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="channels"
        options={{
          title: 'Channels',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden routes - using href: null to completely remove from tab bar */}
      <Tabs.Screen
        name="alerts"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="[username]"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
} 