import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorSchemeConfig } from '~/lib/themes/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { Platform } from 'react-native';
import { 
  whatsappDarkModeColors, whatsappLightModeColors,
  draculaDarkModeColors, draculaLightModeColors,
  twitterDarkModeColors, twitterLightModeColors,
  facebookDarkModeColors, facebookLightModeColors
} from '~/lib/themes';

const COLOR_SCHEME_STORAGE_KEY = '@color-scheme';
const THEME_STORAGE_KEY = '@theme-name';
const DARK_MODE_STORAGE_KEY = '@dark-mode';

export type ThemeName = 'whatsapp' | 'dracula' | 'twitter' | 'facebook';

interface ColorSchemeContextType {
  colorScheme: ColorSchemeConfig;
  themeName: ThemeName;
  updateTheme: (newThemeName: ThemeName) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface ColorSchemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeName;
  initialDarkMode?: boolean;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
}

const themes = {
  whatsapp: {
    light: whatsappLightModeColors,
    dark: whatsappDarkModeColors,
  },
  dracula: {
    light: draculaLightModeColors,
    dark: draculaDarkModeColors,
  },
  twitter: {
    light: twitterLightModeColors,
    dark: twitterDarkModeColors,
  },
  facebook: {
    light: facebookLightModeColors,
    dark: facebookDarkModeColors,
  },
} as const;

export function ColorSchemeProvider({ 
  children, 
  initialTheme = 'whatsapp',
  initialDarkMode = true 
}: ColorSchemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    // Load saved preferences
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(DARK_MODE_STORAGE_KEY)
    ]).then(([savedTheme, savedDarkMode]) => {
      if (savedTheme && savedTheme in themes) {
        setThemeName(savedTheme as ThemeName);
      }
      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true');
      }
    });
  }, []);

  const colorScheme = themes[themeName][isDarkMode ? 'dark' : 'light'];

  useEffect(() => {
    // Update Android navigation bar when color scheme changes
    if (Platform.OS === 'android') {
      setAndroidNavigationBar(colorScheme.name);
    }
    
    // Update web background if on web platform
    if (Platform.OS === 'web') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(colorScheme.name);
    }

    // Persist preferences
    AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme.name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [colorScheme.name, themeName]);

  const updateTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, String(newValue));
      return newValue;
    });
  };

  return (
    <ColorSchemeContext.Provider value={{ 
      colorScheme, 
      themeName, 
      updateTheme,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </ColorSchemeContext.Provider>
  );
} 