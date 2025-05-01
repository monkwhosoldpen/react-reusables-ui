import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { useChannels } from '~/lib/enhanced-chat/hooks/useChannels';

export default function OverviewScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { channels, isLoading, error } = useChannels('janedoe');
  const mainChannel = channels[0];

  // Apply design system tokens
  const cardStyle = {
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
  };

  const titleStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.lg),
    fontWeight: '600' as const,
    marginBottom: Number(design.spacing.margin.card),
  };

  const textStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.base),
  };

  const labelStyle = {
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.sm),
    opacity: 0.7,
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={textStyle}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <Text style={[textStyle, { color: colorScheme.colors.notification }]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{ padding: Number(design.spacing.padding.card) }}
    >
      {/* Profile Section */}
      <View style={[styles.profileSection, cardStyle]}>
        <View style={styles.profileHeader}>
          <Avatar 
            className="h-20 w-20"
            style={[styles.profileAvatar, { borderColor: colorScheme.colors.background }]}
            alt="Profile picture"
          >
            <AvatarImage source={{ uri: 'https://placehold.co/150' }} />
          </Avatar>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colorScheme.colors.text }]}>
              {mainChannel?.username}
            </Text>
            <Text style={[styles.profileHandle, { color: colorScheme.colors.text }]}>
              @{mainChannel?.username}
            </Text>
          </View>
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.profileLocation, { color: colorScheme.colors.text }]}>
            {mainChannel?.stateName}
          </Text>
          <Text style={[styles.profileStats, { color: colorScheme.colors.text }]}>
            {channels.length - 1} Related Channels
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    marginRight: 16,
    borderWidth: 2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileDetails: {
    marginTop: 16,
  },
  profileLocation: {
    fontSize: 16,
    marginBottom: 8,
  },
  profileStats: {
    fontSize: 16,
  },
}); 