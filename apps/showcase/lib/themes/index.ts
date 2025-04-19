import { ColorSchemeConfig } from "./types";

// WhatsApp Theme Colors
export const whatsappLightModeColors: ColorSchemeConfig = {
  name: 'light',
  colors: {
    primary: '#128C7E', // Darker WhatsApp green
    background: '#FFFFFF',
    card: '#F0F2F5',
    text: '#111B21',
    border: '#E9EDEF',
    notification: '#25D366',
    input: '#FFFFFF',
    muted: '#667781',
  },
};

export const whatsappDarkModeColors: ColorSchemeConfig = {
  name: 'dark',
  colors: {
    primary: '#075E54', // Material Design dark green
    background: '#111B21',
    card: '#1F2C33',
    text: '#E9EDEF',
    border: '#2A3942',
    notification: '#25D366',
    input: '#2A3942',
    muted: '#8696A0',
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
    input: '#FFFFFF',
    muted: '#7B8B6F',
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
    input: '#2D2D2D',
    muted: '#9DBF8E',
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
    input: '#FFFFFF',
    muted: '#666666',
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
    input: '#1A1A1A',
    muted: '#999999',
  },
};

// Theme Configurations
export const themes = {
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
