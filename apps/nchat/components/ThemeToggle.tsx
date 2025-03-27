import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';

interface ThemeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const { isDark, setIsDark } = useTheme();

  const handleToggle = (value: boolean) => {
    setIsDark(value);
    onToggle?.(value);
  };

  return (
    <Switch
      value={isDark}
      onValueChange={handleToggle}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={isDark ? '#f5dd4b' : '#f4f3f4'}
    />
  );
}
