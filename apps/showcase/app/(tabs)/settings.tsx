import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
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
      // Only update design if the theme exists in the design system
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
  };

  const cardStyle = {
    backgroundColor: colorScheme.colors.background,
    padding: Number(design.spacing.padding.item),
    borderRadius: Number(design.radius.md),
  };

  const titleStyle = {
    color: colorScheme.colors.primary,
    fontSize: Number(design.spacing.fontSize.sm),
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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
          Account
        </Text>
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
          {user ? (
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
          )}
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
          Appearance
        </Text>
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
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
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
          Language
        </Text>
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
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
        </View>
      </View>

      {/* Theme Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.colors.text }]}>
          Current Theme
        </Text>
        
        <View style={[styles.card, { backgroundColor: colorScheme.colors.card }]}>
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              Theme
            </Text>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              {themeName}
            </Text>
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              Mode
            </Text>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              {colorScheme.name}
            </Text>
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
              Primary Color
            </Text>
            <View style={styles.themePreview}>
              <View 
                style={[
                  styles.themeColor,
                  { backgroundColor: colorScheme.colors.primary }
                ]} 
              />
              <Text style={[styles.settingLabel, { color: colorScheme.colors.text }]}>
                {colorScheme.colors.primary}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dashboard Link */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.card, { 
            backgroundColor: colorScheme.colors.card,
            paddingVertical: 16,
            paddingHorizontal: 16,
          }]}
          onPress={() => Linking.openURL('https://showcase.fixd.ai/dashboard')}
        >
          <View style={{ gap: 4 }}>
            <Text style={[styles.settingLabel, { color: colorScheme.colors.primary }]}>
              Dashboard
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Open dashboard in new tab
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLast: {
    borderBottomWidth: 0,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    minWidth: 80,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  }
});