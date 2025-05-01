import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface DashboardHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function DashboardHeader({ title, showBackButton, onBackPress }: DashboardHeaderProps) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isDesktop = width >= 768;
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.card }]}>
      <View style={[styles.content, isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBackPress}
            >
              <MaterialIcons name="arrow-back" size={24} color={colorScheme.colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: colorScheme.colors.text }]}>{title}</Text>
        </View>

        {/* Center Section - Navigation Links */}
        {isDesktop && (
          <View style={styles.centerSection}>
            <TouchableOpacity 
              style={styles.navLink}
              onPress={() => router.push('/')}
            >
              <Text style={[styles.navText, { color: colorScheme.colors.text }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navLink}
              onPress={() => router.push('/dashboard')}
            >
              <Text style={[styles.navText, { color: colorScheme.colors.text }]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navLink}
              onPress={() => router.push('/dashboard/tenant-requests')}
            >
              <Text style={[styles.navText, { color: colorScheme.colors.text }]}>Tenant Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navLink}
              onPress={() => router.push('/dashboard/ai-dashboard')}
            >
              <Text style={[styles.navText, { color: colorScheme.colors.text }]}>AI Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Right Section - User Info */}
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={[styles.userButton, { backgroundColor: `${colorScheme.colors.primary}1A` }]}
            onPress={() => router.push('/profile')}
          >
            <MaterialIcons name="person" size={24} color={colorScheme.colors.primary} />
            {isDesktop && (
              <Text style={[styles.userText, { color: colorScheme.colors.text }]}>John Doe</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    paddingVertical: 8,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 8,
  },
  userText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 