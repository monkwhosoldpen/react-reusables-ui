import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme, type ThemeName } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { type DesignType } from '~/lib/providers/theme/types';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '~/lib/contexts/AuthContext';
import LanguageChanger from '@/components/common/LanguageChanger';
import { config } from '~/lib/config';
import { FlashList } from '@shopify/flash-list';
import { cn } from '~/lib/utils';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Muted } from '~/components/ui/typography';

const contentInsets = {
  left: 12,
  right: 12,
};

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

  const handleThemeChange = (newTheme: string) => {
    updateTheme(newTheme as ThemeName);
    if (newTheme !== 'redblack') {
      updateDesign(newTheme as DesignType);
    }
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
            </View>
            <ThemeDropdownSelect defaultValue={themeName} onValueChange={handleThemeChange} />
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
              setValue('dracula');
              onValueChange('dracula');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'dracula' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Dracula</Text>
            <Muted>Dark theme with purple accents</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('twitter');
              onValueChange('twitter');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'twitter' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Twitter</Text>
            <Muted>Social media inspired theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('facebook');
              onValueChange('facebook');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'facebook' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Facebook</Text>
            <Muted>Social media inspired theme</Muted>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              setValue('spotify');
              onValueChange('spotify');
            }}
            className={cn(
              'flex-col items-start gap-1',
              value === 'spotify' ? 'bg-secondary/70' : ''
            )}
          >
            <Text>Spotify</Text>
            <Muted>Music streaming inspired theme</Muted>
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