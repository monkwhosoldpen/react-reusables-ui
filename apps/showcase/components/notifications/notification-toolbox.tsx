import { View, Text, Pressable, useColorScheme } from 'react-native';
import fetch from 'node-fetch';

export const Toolbox = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sendNotification = async (username?: string) => {
    try {
      const response = await fetch('https://showcase-nconnect-api.vercel.app/api/alerts/elon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: username ? `Hello ${username}!` : 'Hello World',
          message: username 
            ? `This is a test notification for ${username}!`
            : 'This is a test notification from the demo page!'
        })
      });
      
      const data = await response.json();
      console.log('Notification sent:', data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendRichNotification = async () => {
    try {
      const response = await fetch('https://showcase-nconnect-api.vercel.app/api/alerts/elon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🌟 Rich Notification Demo',
          message: `# Welcome to Rich Notifications!
          
**This is a bold message** with *italic text* and more!

• Feature 1: Rich text formatting
• Feature 2: Custom icons and badges
• Feature 3: Interactive actions
• Feature 4: Vibrations and sounds

Click the buttons below to interact!`,
          icon: '/icons/icon-192x192.png',
          image: '/icons/icon-512x512.png',
          badge: '/icons/badge-5plus.png',
          vibrate: [100, 50, 100],
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Details'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ],
          formatting: {
            title: {
              bold: true
            },
            sections: [
              {
                heading: 'Welcome to Rich Notifications!'
              }
            ],
            bullets: [
              'Feature 1: Rich text formatting',
              'Feature 2: Custom icons and badges',
              'Feature 3: Interactive actions',
              'Feature 4: Vibrations and sounds'
            ],
            bold: 'This is a bold message',
            italic: 'italic text'
          },
          data: {
            type: 'rich-notification',
            timestamp: new Date().toISOString(),
            testInfo: {
              source: 'demo-page',
              component: 'RichNotificationButton',
              version: '1.0'
            }
          }
        })
      });
      
      const data = await response.json();
      console.log('Rich notification sent:', data);
    } catch (error) {
      console.error('Error sending rich notification:', error);
    }
  };

  return (
    <View className={`p-4 mb-5 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <Text className={`text-lg font-bold mb-3 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        Notification Toolbox
      </Text>
      <View className="gap-3">
        <Pressable 
          className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
          onPress={() => sendNotification()}
        >
          <Text className="text-white text-base font-bold text-center">
            Send Hello World Notification
          </Text>
        </Pressable>

        <Pressable 
          className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-green-600' : 'bg-green-500'}`}
          onPress={() => sendNotification('janedoe_pro')}
        >
          <Text className="text-white text-base font-bold text-center">
            Send to janedoe_pro
          </Text>
        </Pressable>

        <Pressable 
          className={`p-4 rounded-lg shadow-md ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`}
          onPress={sendRichNotification}
        >
          <Text className="text-white text-base font-bold text-center">
            Send Rich Notification
          </Text>
        </Pressable>
      </View>
    </View>
  );
}; 