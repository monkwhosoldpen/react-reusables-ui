import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useChannels } from '~/lib/hooks/useChannels';
import { Channel } from '~/lib/types/channel.types';

export default function ChannelInfoScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { colorScheme } = useColorScheme();
  const { channels } = useChannels(username);
  
  const channel = channels?.find(c => c.username === username);

  if (!channel) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <Text>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{channel.title}</Text>
        <Text style={styles.description}>{channel.description}</Text>
        <Text style={styles.meta}>Created by: {channel.username}</Text>
        <Text style={styles.meta}>Members: {channel.memberCount || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  meta: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
}); 