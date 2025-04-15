import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { mockTenant } from './mocktenant';

export default function OverviewScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

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
            <AvatarImage
              source={{ uri: "https://placehold.co/200x200" }}
            />
          </Avatar>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, titleStyle]}>
              {mockTenant.username}
            </Text>
            <Text style={[styles.username, labelStyle]}>
              @{mockTenant.username}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, labelStyle]}>Location</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {mockTenant.stateName}, {mockTenant.assemblyName}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, labelStyle]}>Related Channels</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {mockTenant.related_channels?.length || 0}
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
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    borderWidth: 4,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  username: {
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600',
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