import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme, type ThemeName } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { type DesignType } from '~/lib/providers/theme/types';
import { Switch } from '~/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, type Option } from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '~/lib/contexts/AuthContext';
import LanguageChanger from '@/components/common/LanguageChanger';
import { config } from '~/lib/config';
import { FlashList } from '@shopify/flash-list';
import { cn } from '~/lib/utils';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colorScheme, themeName, updateTheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design, updateDesign } = useDesign();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleThemeChange = (option: Option) => {
    if (option?.value) {
      const newTheme = option.value as ThemeName;
      updateTheme(newTheme);
      if (newTheme !== 'redblack') {
        updateDesign(newTheme as DesignType);
      }
    }
  };

  // Apply design system tokens
  const sectionStyle = {
    ...styles.section,
    backgroundColor: colorScheme.colors.card,
    padding: Number(design.spacing.padding.card),
    borderRadius: Number(design.radius.lg),
    marginBottom: Number(design.spacing.margin.card),
    shadowColor: colorScheme.colors.border,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const cardStyle = {
    backgroundColor: colorScheme.colors.background,
    padding: Number(design.spacing.padding.item),
    borderRadius: Number(design.radius.md),
    marginTop: Number(design.spacing.margin.item),
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.sm),
    fontWeight: '600',
    marginBottom: Number(design.spacing.margin.item),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

  const settingsData = [
    {
      id: 'account',
      title: 'Account',
      content: user ? (
        <>
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
                Signed in as
              </Text>
              <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
                {user.email || 'Guest'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colorScheme.colors.notification }]}
            onPress={handleSignOut}
          >
            <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              Not signed in
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Sign in to sync your preferences
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colorScheme.colors.primary }]}
            onPress={handleSignIn}
          >
            <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      id: 'appearance',
      title: 'Appearance',
      content: (
        <>
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
                Use dark theme
              </Text>
            </View>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <View>
              <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
                Theme
              </Text>
              <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
                Choose your preferred style
              </Text>
            </View>
            <Select 
              defaultValue={{ value: themeName, label: themeName }}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp" label="WhatsApp" />
                <SelectItem value="dracula" label="Dracula" />
                <SelectItem value="twitter" label="Twitter" />
                <SelectItem value="facebook" label="Facebook" />
                <SelectItem value="spotify" label="Spotify" />
                <SelectItem value="ghiblistudio" label="Studio Ghibli" />
                <SelectItem value="redblack" label="Red-Black" />
              </SelectContent>
            </Select>
          </View>
        </>
      ),
    },
    {
      id: 'language',
      title: 'Language',
      content: (
        <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              App Language
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Choose your preferred language
            </Text>
          </View>
          <LanguageChanger variant="settings" />
        </View>
      ),
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      content: (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colorScheme.colors.primary }]}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={[styles.buttonText, { color: colorScheme.colors.background }]}>
            Open Dashboard
          </Text>
        </TouchableOpacity>
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      <FlashList
        data={settingsData}
        estimatedItemSize={100}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}
        renderItem={({ item, index }) => (
          <View 
            style={[
              styles.section,
              { 
                backgroundColor: colorScheme.colors.card,
                marginBottom: index === settingsData.length - 1 ? 24 : 16,
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
              {item.title}
            </Text>
            <View style={[styles.card, { backgroundColor: colorScheme.colors.background }]}>
              {item.content}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});