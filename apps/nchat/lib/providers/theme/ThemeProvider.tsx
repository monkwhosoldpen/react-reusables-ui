import React, { createContext, useContext } from 'react';
import { useColorScheme, ThemeName } from './ColorSchemeProvider';
import { useDesign } from './DesignSystemProvider';
import { Theme } from '~/lib/themes/types';

interface ThemeContextType {
  theme: Theme;
  updateDesign: (newDesign: any) => void;
  updateColorScheme: (newTheme: ThemeName) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme, updateTheme: updateColorScheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design, updateDesign } = useDesign();

  const theme: Theme = {
    colorScheme,
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      updateDesign,
      updateColorScheme,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
} 