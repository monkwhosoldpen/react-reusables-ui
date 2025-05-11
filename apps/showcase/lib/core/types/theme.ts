import { Theme as NavigationTheme } from '@react-navigation/native';

export interface ColorScheme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  name: 'light' | 'dark';
}

export interface Theme extends NavigationTheme {
  colorScheme: ColorScheme;
} 