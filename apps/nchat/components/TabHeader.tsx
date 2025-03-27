import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

interface TabHeaderProps {
  title: string;
  showSearch?: boolean;
  showMenu?: boolean;
  showCamera?: boolean;
  showAdmin?: boolean;
  showCategory?: boolean;
  selectedCategory?: string;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  onCameraPress?: () => void;
  onAdminPress?: () => void;
  onCategoryChange?: (category: string) => void;
}

export function TabHeader({
  title,
  showSearch = true,
  showMenu = true,
  showCamera = false,
  showAdmin = false,
  showCategory = false,
  selectedCategory = 'news',
  onSearchPress,
  onMenuPress,
  onCameraPress,
  onAdminPress,
  onCategoryChange,
}: TabHeaderProps) {
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: parseInt(theme.design.spacing.padding.item),
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
        },
      }),
      pointerEvents: 'auto'
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: parseInt(theme.design.spacing.fontSize.lg),
      fontWeight: '600',
      color: theme.colors.background,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginLeft: parseInt(theme.design.spacing.gap) * 3,
      color: theme.colors.background,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: parseInt(theme.design.spacing.gap),
      paddingHorizontal: parseInt(theme.design.spacing.padding.item),
      paddingVertical: parseInt(theme.design.spacing.padding.item) / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: parseInt(theme.design.radius.full),
    },
    categoryText: {
      color: theme.colors.background,
      fontSize: parseInt(theme.design.spacing.fontSize.sm),
      marginRight: parseInt(theme.design.spacing.gap) / 2,
    },
    categoryPicker: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      zIndex: 1000,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
        },
      }),
    },
    categoryOption: {
      padding: parseInt(theme.design.spacing.padding.item),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    selectedCategory: {
      backgroundColor: theme.colors.card,
    },
    categoryOptionText: {
      fontSize: parseInt(theme.design.spacing.fontSize.base),
      color: theme.colors.text,
    },
    selectedCategoryText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {showCategory && (
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
              <Ionicons 
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} 
                size={parseInt(theme.design.spacing.iconSize)} 
                color={theme.colors.background} 
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerIcons}>
          {showCamera && (
            <TouchableOpacity onPress={onCameraPress}>
              <Ionicons 
                name="camera-outline" 
                size={parseInt(theme.design.spacing.iconSize)} 
                style={styles.icon} 
              />
            </TouchableOpacity>
          )}
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress}>
              <Ionicons 
                name="search-outline" 
                size={parseInt(theme.design.spacing.iconSize)} 
                style={styles.icon} 
              />
            </TouchableOpacity>
          )}
          {showAdmin && (
            <TouchableOpacity onPress={onAdminPress}>
              <Ionicons 
                name="shield-outline" 
                size={parseInt(theme.design.spacing.iconSize)} 
                style={styles.icon} 
              />
            </TouchableOpacity>
          )}
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress}>
              <Ionicons 
                name="ellipsis-vertical" 
                size={parseInt(theme.design.spacing.iconSize)} 
                style={styles.icon} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
} 