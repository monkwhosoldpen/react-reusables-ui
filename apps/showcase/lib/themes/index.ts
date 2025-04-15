import { ColorSchemeConfig } from "./types";

// WhatsApp Theme Colors
export const whatsappLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#008069',
    background: '#FFFFFF',
    card: '#F0F2F5',
    text: '#111B21',
    border: '#E9EDEF',
    notification: '#25D366',
  },
};

export const whatsappDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#00A884',
    background: '#111B21',
    card: '#1F2C33',
    text: '#E9EDEF',
    border: '#2A3942',
    notification: '#25D366',
  },
};

// Twitter Theme Colors
export const twitterLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#1D9BF0',
    background: '#FFFFFF',
    card: '#F7F9F9',
    text: '#0F1419',
    border: '#EFF3F4',
    notification: '#F91880',
  },
};

export const twitterDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#1D9BF0',
    background: '#000000',
    card: '#16181C',
    text: '#E7E9EA',
    border: '#2F3336',
    notification: '#F91880',
  },
};

// Facebook Theme Colors
export const facebookLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#1877F2',
    background: '#F0F2F5',
    card: '#FFFFFF',
    text: '#050505',
    border: '#CED0D4',
    notification: '#F02849',
  },
};

export const facebookDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#2374E1',
    background: '#18191A',
    card: '#242526',
    text: '#E4E6EB',
    border: '#3E4042',
    notification: '#F02849',
  },
};

// Dracula Theme Colors
export const draculaLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#BD93F9',
    background: '#F8F8F2',
    card: '#FFFFFF',
    text: '#282A36',
    border: '#6272A4',
    notification: '#FF79C6',
  },
};

export const draculaDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#BD93F9',
    background: '#282A36',
    card: '#44475A',
    text: '#F8F8F2',
    border: '#6272A4',
    notification: '#FF79C6',
  },
};

// Spotify Theme Colors
export const spotifyLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#1DB954',
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#191414',
    border: '#E5E5E5',
    notification: '#1DB954',
  },
};

export const spotifyDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#1DB954',
    background: '#121212',
    card: '#181818',
    text: '#FFFFFF',
    border: '#282828',
    notification: '#1DB954',
  },
};

// Studio Ghibli Theme Colors
export const ghiblistudioLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#7B8B6F', // Soft forest green
    background: '#F5F5F0', // Creamy white
    card: '#FFFFFF',
    text: '#2C3E50', // Deep blue-gray
    border: '#E0D8C0', // Warm beige
    notification: '#E6A8A8', // Soft pink
  },
};

export const ghiblistudioDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#9DBF8E', // Muted sage green
    background: '#1A1A1A', // Deep charcoal
    card: '#2D2D2D',
    text: '#E0D8C0', // Warm beige
    border: '#3D3D3D',
    notification: '#E6A8A8', // Soft pink
  },
};

// Red-Black Theme Colors
export const redblackLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#FF0000', // Bright red
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#FF0000', // Bright red
  },
};

export const redblackDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#FF0000', // Bright red
    background: '#000000',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#FF0000', // Bright red
  },
};

// Theme Configurations
export const themes = {
  whatsapp: {
    light: whatsappLightModeColors,
    dark: whatsappDarkModeColors,
  },
  twitter: {
    light: twitterLightModeColors,
    dark: twitterDarkModeColors,
  },
  facebook: {
    light: facebookLightModeColors,
    dark: facebookDarkModeColors,
  },
  dracula: {
    light: draculaLightModeColors,
    dark: draculaDarkModeColors,
  },
  spotify: {
    light: spotifyLightModeColors,
    dark: spotifyDarkModeColors,
  },
} as const;
