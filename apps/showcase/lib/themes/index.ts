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
} as const;
