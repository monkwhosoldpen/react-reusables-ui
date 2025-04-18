import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { useColorScheme } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { ChevronLeft } from 'lucide-react-native';
import { MaterialIcons } from "@expo/vector-icons";

interface CommonHeaderProps {
  title?: string;
  logoUrl?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  user?: {
    username?: string;
    avatar?: string;
  };
}

export function CommonHeader({
  title = 'nchat',
  logoUrl = 'https://placehold.co/32x32',
  showBackButton = false,
  onBackPress,
  user,
}: CommonHeaderProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  // Helper function to determine if dark mode
  const isDarkMode = colorScheme.colors.text === '#ffffff' || colorScheme.colors.background === '#000000';
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colorScheme.colors.border,
      backgroundColor: colorScheme.colors.primary,
    },
    headerContent: {
      width: '100%',
      maxWidth: 1200,
      alignSelf: 'center',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logo: {
      width: 32,
      height: 32,
      marginRight: 8,
      borderRadius: 16,
      overflow: 'hidden',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: avatarBgColor,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    itemSubtitle: {
      fontSize: 14,
      opacity: 0.8,
    },
    backButton: {
      marginRight: 8,
      padding: 8,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ChevronLeft size={24} color={colorScheme.colors.background} />
            </TouchableOpacity>
          )}
          {!showBackButton ? (
            <Link href="/" asChild>
              <TouchableOpacity style={styles.logoContainer}>
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>
                  {title}
                </Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.primary }]}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>
                  {user?.username || title}
                </Text>
                <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                  {user?.username ? 'Welcome back' : 'Navigation'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
} 