import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { mockTenant } from './mocktenant';

export default function OverviewScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{ padding: Number(design.spacing.padding.card) }}
    >

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Avatar 
            className="h-20 w-20"
            style={styles.profileAvatar}
            alt="Profile picture"
          >
            <AvatarImage
              source={{ uri: "https://placehold.co/200x200" }}
            />
          </Avatar>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colorScheme.colors.text }]}>
              {mockTenant.username}
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverContainer: {
    height: 200,
    width: '100%',
    marginBottom: -40,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  profileAvatar: {
    borderWidth: 4,
    borderColor: '#fff',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    opacity: 0.7,
  },
  bioSection: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 