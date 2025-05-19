import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '~/lib/core/contexts/AuthContext';
import { PREMIUM_CONFIGS, global_superadmin } from '~/lib/in-app-db/states/telangana/premium-data';

export default function AIUserAnalyticsTab() {
  const { username } = useLocalSearchParams();
  const { user } = useAuth();

  // Find the channel in all configs to get owner
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(ch => ch.username === username);
      if (channel) {
        return {
          ownerUsername,
          channel,
          config
        };
      }
    }
    return null;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username as string];
  const clientType = premiumConfig?.client_type || 'public';
  const isPublic = !premiumConfig || Object.keys(premiumConfig).length === 0 || premiumConfig.is_public;
  
  // Get user role and access
  const userRole = premiumConfig?.roles ? 
    Object.entries(premiumConfig.roles).find(([_, emails]) => 
      Array.isArray(emails) && emails.includes(user?.email || '')
    )?.[0] : null;

  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0 
    ? (user?.email ? user.email === global_superadmin : false) 
    : userRole !== null;
  
  return (
    <View className="p-4">
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        AI User Analytics Content
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">
        Channel: {username}
      </Text>
    </View>
  );
} 