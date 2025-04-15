import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { ChevronLeft } from 'lucide-react-native';

interface CommonHeaderProps {
  title?: string;
  logoUrl?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function CommonHeader({
  title = 'nchat',
  logoUrl = 'https://placehold.co/32x32',
  showBackButton = false,
  onBackPress,
}: CommonHeaderProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Apply design system tokens
  const headerStyle = {
    ...styles.header,
    backgroundColor: colorScheme.colors.card,
    borderBottomColor: colorScheme.colors.border,
    height: Platform.select({ 
      ios: 60, 
      android: 60, 
      default: 64 
    }),
    paddingHorizontal: Number(design.spacing.padding.card),
  };

  const titleStyle = {
    ...styles.title,
    color: colorScheme.colors.text,
    fontSize: Number(design.spacing.fontSize.lg),
    fontWeight: '600' as const,
  };

  const backButtonStyle = {
    ...styles.backButton,
    padding: Number(design.spacing.padding.item),
  };

  return (
    <View style={headerStyle}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={backButtonStyle}>
            <ChevronLeft size={24} color={colorScheme.colors.text} />
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
              <Text style={titleStyle}>{title}</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <Text style={titleStyle}>{title}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
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
  title: {
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: 8,
  },
}); 