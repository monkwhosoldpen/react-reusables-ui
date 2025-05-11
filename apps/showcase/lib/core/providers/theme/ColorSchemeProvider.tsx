import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorSchemeConfig } from '~/lib/core/themes/types';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { Platform } from 'react-native';
import { 
  whatsappDarkModeColors, whatsappLightModeColors,
  ghiblistudioDarkModeColors, ghiblistudioLightModeColors,
  redblackDarkModeColors, redblackLightModeColors
} from '~/lib/core/themes';

const COLOR_SCHEME_STORAGE_KEY = '@color-scheme';
const THEME_STORAGE_KEY = '@theme-name';
const DARK_MODE_STORAGE_KEY = '@dark-mode';

export type ThemeName = 'whatsapp' | 'ghiblistudio' | 'redblack';

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
  ghiblistudio: {
    light: ghiblistudioLightModeColors,
    dark: ghiblistudioDarkModeColors,
  },
  redblack: {
    light: redblackLightModeColors,
    dark: redblackDarkModeColors,
  },
} as const;

export function ColorSchemeProvider({ 
  children, 
  initialTheme = 'whatsapp',
  initialDarkMode = true 
}: ColorSchemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

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

  }, [colorScheme.name, themeName]);

  const updateTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
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