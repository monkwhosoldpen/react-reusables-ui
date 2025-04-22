import { View, StyleSheet, ScrollView, useWindowDimensions, SafeAreaView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { CommonHeader } from '~/components/CommonHeader';
import { useChannels } from '~/lib/hooks/useChannels';

export default function ChannelInfoScreen() {
  const { username } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();
  const { channels, isLoading } = useChannels(username as string);
  const channel = channels?.[0]; // Get the main channel

  const isDesktop = width >= 768;
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';

  const renderInfoSection = (title: string, data: any) => {
    if (!data) return null;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>{title.toUpperCase()}</Text>
        <Card style={styles.sectionContent}>
          {Object.entries(data).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) return null;
            return (
              <View key={key} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: subtitleColor }]}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </Text>
                <Text style={[styles.infoValue, { color: colorScheme.colors.text }]}>
                  {String(value)}
                </Text>
              </View>
            );
          })}
        </Card>
      </View>
    );
  };

  const renderStoreSection = (title: string, items: any[]) => {
    if (!items?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionHeaderText, { color: subtitleColor }]}>{title.toUpperCase()}</Text>
        <View style={[styles.storeGrid, isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: Number(design.spacing.gap) }]}>
          {items.map((item, index) => (
            <Card key={index} style={[styles.storeItem, isDesktop && { flex: 1, minWidth: 200, maxWidth: '48%' }]}>
              <View style={[styles.storeIcon, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
                <MaterialIcons name="store" size={24} color={colorScheme.colors.primary} />
              </View>
              <Text style={[styles.storeTitle, { color: colorScheme.colors.text }]}>
                {item.name || item.title || 'Unnamed Item'}
              </Text>
              <Text style={[styles.storeDescription, { color: subtitleColor }]}>
                {item.description || 'No description available'}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <CommonHeader title="Channel Info" />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colorScheme.colors.text }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!channel) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <CommonHeader title="Channel Info" />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colorScheme.colors.text }}>Channel not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <CommonHeader title="Channel Info" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.primary}1A` }]}>
            <MaterialIcons name="business" size={32} color={colorScheme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: colorScheme.colors.text }]}>{channel.username}</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {channel.is_premium ? 'Premium Tenant' : 'Standard Tenant'}
          </Text>
        </View>

        {/* Basic Information */}
        {renderInfoSection('Basic Information', {
          'Tenant URL': channel.tenant_supabase_url,
          'Update Only': channel.is_update_only ? 'Yes' : 'No',
          'Premium Status': channel.is_premium ? 'Yes' : 'No',
          'Public Status': channel.is_public ? 'Yes' : 'No',
          'Agent Status': channel.is_agent ? 'Yes' : 'No',
          'State': channel.stateName,
          'Parliamentary Constituency': channel.parliamentaryConstituency,
        })}

        {/* Products */}
        {renderStoreSection('Products', channel.products)}

        {/* Related Channels */}
        {renderStoreSection('Related Channels', channel.related_channels?.map(ch => ({
          name: ch.username,
          description: ch.stateName
        })))}

        {/* Onboarding Configuration */}
        {channel.onboardingConfig && renderInfoSection('Onboarding Configuration', {
          'Welcome Screen Hero': channel.onboardingConfig.welcomescreen.hero,
          'Welcome Text': channel.onboardingConfig.welcomescreen.welcomeText,
          'CTA Text': channel.onboardingConfig.welcomescreen.ctaText,
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  storeGrid: {
    gap: 16,
  },
  storeItem: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 