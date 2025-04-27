import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';
import { useColorScheme, type ThemeName } from '@/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '@/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useAuth } from '~/lib/contexts/AuthContext';
import { Switch } from '~/components/ui/switch';
import LanguageChanger from '@/components/common/LanguageChanger';
import { cn } from '~/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { Muted } from '~/components/ui/typography';
import { type DesignType } from '@/lib/providers/theme/types';

const contentInsets = {
  left: 12,
  right: 12,
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colorScheme, themeName, updateTheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design, updateDesign } = useDesign();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;

  // Helper function to determine if dark mode
  const avatarBgColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#E8EEF2';
  const subtitleColor = isDarkMode ? 'rgba(255,255,255,0.7)' : '#64748B';
  const timestampColor = isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748B';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.colors.background,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: insets.bottom + 20,
    },
    desktopContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 20,
    },
    sectionContainer: {
      marginBottom: 32,
      paddingHorizontal: 4,
      width: isDesktop ? '50%' : '100%',
    },
    sectionContainerLeft: {
      paddingRight: isDesktop ? 16 : 0,
    },
    sectionContainerRight: {
      paddingLeft: isDesktop ? 16 : 0,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colorScheme.colors.card,
      borderRadius: 12,
      marginVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      backgroundColor: `${colorScheme.colors.primary}1A`,
    },
    itemContent: {
      flex: 1,
      marginRight: 16,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: colorScheme.colors.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: subtitleColor,
      lineHeight: 20,
    },
    sectionHeader: {
      paddingVertical: 16,
      paddingHorizontal: 4,
      marginTop: 8,
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: subtitleColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    cardContainer: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
    },
    signOutButton: {
      backgroundColor: colorScheme.colors.notification,
      padding: 12,
      borderRadius: Number(design.radius.md),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Number(design.spacing.padding.item),
    },
    signOutButtonText: {
      color: colorScheme.colors.background,
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '600',
      marginLeft: Number(design.spacing.padding.item),
    },
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleThemeChange = (newTheme: string) => {
    updateTheme(newTheme as ThemeName);
    if (newTheme !== 'redblack') {
      updateDesign(newTheme as DesignType);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop ? styles.desktopContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Left Column */}
        <View style={[styles.sectionContainer, styles.sectionContainerLeft]}>
          {/* Account Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>ACCOUNT</Text>
          </View>
          <View style={styles.cardContainer}>
            {user ? (
              <>
                <View style={[styles.item, { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }]}>
                  <View style={styles.avatar}>
                    <MaterialIcons name="person" size={24} color={colorScheme.colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>Signed in as</Text>
                    <Text style={styles.itemSubtitle}>{user.email || 'Guest'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                >
                  <MaterialIcons name="logout" size={20} color={colorScheme.colors.background} />
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.item, { backgroundColor: colorScheme.colors.primary }]}
                onPress={handleSignIn}
              >
                <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.background}1A` }]}>
                  <MaterialIcons name="login" size={24} color={colorScheme.colors.background} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>Sign In</Text>
                  <Text style={[styles.itemSubtitle, { color: colorScheme.colors.background, opacity: 0.8 }]}>
                    Sign in to sync your preferences
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Appearance Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>APPEARANCE</Text>
          </View>
          <View style={styles.cardContainer}>
            <View style={[styles.item, { borderBottomWidth: 1, borderBottomColor: `${colorScheme.colors.text}1A` }]}>
              <View style={styles.avatar}>
                <MaterialIcons name="dark-mode" size={24} color={colorScheme.colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Dark Mode</Text>
                <Text style={styles.itemSubtitle}>Use dark theme</Text>
              </View>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </View>
            <View style={styles.item}>
              <View style={styles.avatar}>
                <MaterialIcons name="palette" size={24} color={colorScheme.colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Theme</Text>
              </View>
              <ThemeDropdownSelect defaultValue={themeName} onValueChange={handleThemeChange} />
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={[styles.sectionContainer, styles.sectionContainerRight]}>
          {/* Language Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>LANGUAGE</Text>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.item}>
              <View style={styles.avatar}>
                <MaterialIcons name="language" size={24} color={colorScheme.colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>App Language</Text>
              </View>
              <LanguageChanger variant="settings" />
            </View>
          </View>

          {/* Dashboard Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>DASHBOARD</Text>
          </View>
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[styles.item, { backgroundColor: colorScheme.colors.primary }]}
              onPress={() => router.push('/dashboard')}
            >
              <View style={[styles.avatar, { backgroundColor: `${colorScheme.colors.background}1A` }]}>
                <MaterialIcons name="dashboard" size={24} color={colorScheme.colors.background} />
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colorScheme.colors.background }]}>
                  Open Dashboard
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ThemeDropdownSelect({ 
  defaultValue, 
  onValueChange 
}: { 
  defaultValue: string;
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingRight: 12,
          }}
        >
          <Text>{value}</Text>
          <ChevronDown size={18} className="text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" insets={contentInsets} className="w-64 native:w-72">
        <DropdownMenuLabel>Select theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="gap-1">
          <DropdownMenuItem
            onPress={() => {
              setValue('whatsapp');
              onValueChange('whatsapp');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'whatsapp' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>WhatsApp</Text>
            <Muted>Modern messaging theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('ghiblistudio');
              onValueChange('ghiblistudio');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'ghiblistudio' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Studio Ghibli</Text>
            <Muted>Animated movie inspired theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('redblack');
              onValueChange('redblack');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'redblack' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Red-Black</Text>
            <Muted>High contrast theme</Muted>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}