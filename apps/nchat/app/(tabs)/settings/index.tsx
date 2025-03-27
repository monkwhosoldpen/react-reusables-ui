import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { useColorScheme, type ThemeName } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Switch } from '~/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, type Option } from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { supabase } from '~/lib/supabase';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { colorScheme, themeName, updateTheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design, updateDesign } = useDesign();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleThemeChange = (option: Option) => {
    if (option?.value) {
      const newTheme = option.value as ThemeName;
      updateTheme(newTheme);
      updateDesign(newTheme);
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
      contentContainerStyle={{
        paddingBottom: insets.bottom + Number(design.spacing.padding.card),
        paddingTop: Number(design.spacing.padding.card)
      }}
    >
      {/* Account Section */}
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          Account
        </Text>
        
        {user ? (
          <View style={{ gap: Number(design.spacing.gap) }}>
            <View style={cardStyle}>
              <Text style={labelStyle} className="mb-1">
                Signed in as
              </Text>
              <Text style={textStyle} className="font-medium">
                {user.email || 'Guest'}
              </Text>
            </View>
            
            <Button 
              variant="destructive" 
              onPress={handleSignOut}
              className="w-full"
              style={{ borderRadius: Number(design.radius.md) }}
            >
              <Text className="font-medium">Sign Out</Text>
            </Button>
          </View>
        ) : (
          <View>
            <Text style={labelStyle} className="mb-4">
              Sign in to sync your preferences and access all features
            </Text>
            <Button 
              onPress={handleSignIn}
              style={{ 
                backgroundColor: colorScheme.colors.primary,
                borderRadius: Number(design.radius.md)
              }}
              className="w-full"
            >
              <Text className="font-medium text-white">Sign In</Text>
            </Button>
          </View>
        )}
      </View>

      {/* Appearance Section */}
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          Appearance
        </Text>
        
        <View style={cardStyle} className="overflow-hidden">
          <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
            <View>
              <Text style={textStyle} className="font-medium">
                Dark Mode
              </Text>
              <Text style={labelStyle} className="mt-1">
                Use dark theme
              </Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={textStyle} className="font-medium">
                Theme
              </Text>
              <Text style={labelStyle} className="mt-1">
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
              </SelectContent>
            </Select>
          </View>
        </View>
      </View>

      {/* Theme Info Section */}
      <View style={sectionStyle}>
        <Text style={titleStyle} className="font-medium uppercase">
          Current Theme
        </Text>
        
        <View style={[cardStyle, { gap: Number(design.spacing.gap) }]}>
          <View className="flex-row justify-between items-center">
            <Text style={labelStyle}>
              Theme
            </Text>
            <Text style={textStyle} className="font-medium capitalize">
              {themeName}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text style={labelStyle}>
              Mode
            </Text>
            <Text style={textStyle} className="font-medium capitalize">
              {colorScheme.name}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text style={labelStyle}>
              Primary Color
            </Text>
            <View className="flex-row items-center gap-2">
              <View 
                style={{ 
                  backgroundColor: colorScheme.colors.primary,
                  width: Number(design.spacing.iconSize),
                  height: Number(design.spacing.iconSize),
                  borderRadius: Number(design.radius.sm)
                }}
              />
              <Text style={textStyle} className="font-medium">
                {colorScheme.colors.primary}
              </Text>
            </View>
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
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});