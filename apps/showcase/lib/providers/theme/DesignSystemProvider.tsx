import React, { createContext, useContext, useState, useCallback } from 'react';
import { DesignType, DesignConfig } from './types';

// Twitter's design system - Clean and professional with precise spacing
const twitterDesign: DesignConfig = {
  name: 'twitter',
  spacing: {
    gap: '12', // Twitter uses 12px as base unit
    margin: {
      text: '4',
      card: '16', // Cards have 16px margin
      formGroup: '20',
      section: '32',
      item: '12',
    },
    padding: {
      item: '12',
      card: '16',
      input: '12',
      button: '12',
      section: '24',
    },
    fontSize: {
      xs: '13', // Twitter's smallest text
      sm: '15', // Regular text
      base: '15',
      lg: '17', // Headings
      xl: '20', // Large headings
      '2xl': '24', // Page titles
      '3xl': '32', // Hero text
    },
    lineHeight: {
      normal: '1.2', // Twitter's tight line height
      relaxed: '1.4',
      loose: '1.6',
    },
    iconSize: '24', // Twitter's icon size
    inputHeight: '52', // Twitter's input height
    buttonHeight: '52',
    avatarSize: '48', // Twitter's avatar size
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 2px 4px rgba(0,0,0,0.1)',
    lg: '0 4px 8px rgba(0,0,0,0.1)',
    xl: '0 8px 16px rgba(0,0,0,0.1)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// Facebook's design system - Neutral and balanced with generous spacing
const facebookDesign: DesignConfig = {
  name: 'facebook',
  spacing: {
    gap: '16', // Facebook's base unit
    margin: {
      text: '8',
      card: '16',
      formGroup: '24',
      section: '32',
      item: '16',
    },
    padding: {
      item: '16',
      card: '16',
      input: '16',
      button: '16',
      section: '32',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '15',
      lg: '17',
      xl: '20',
      '2xl': '24',
      '3xl': '32',
    },
    lineHeight: {
      normal: '1.4', // Facebook's comfortable line height
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '20',
    inputHeight: '40', // Facebook's compact inputs
    buttonHeight: '40',
    avatarSize: '40',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 2px 4px rgba(0,0,0,0.1)',
    lg: '0 4px 6px rgba(0,0,0,0.1)',
    xl: '0 8px 12px rgba(0,0,0,0.1)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// WhatsApp's design system - Functional and conversational with mobile-first spacing
const whatsappDesign: DesignConfig = {
  name: 'whatsapp',
  spacing: {
    gap: '8',
    margin: {
      text: '4',
      card: '12',
      formGroup: '16',
      section: '24',
      item: '8',
    },
    padding: {
      item: '12',
      card: '16',
      input: '12',
      button: '12',
      section: '24',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '16', // WhatsApp's base font size
      lg: '18',
      xl: '20',
      '2xl': '24',
      '3xl': '32',
    },
    lineHeight: {
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '24',
    inputHeight: '48',
    buttonHeight: '48',
    avatarSize: '48', // WhatsApp's larger avatars
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 4px 6px rgba(0,0,0,0.12)',
    xl: '0 8px 12px rgba(0,0,0,0.12)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// Dracula's design system - Bold and vibrant with dramatic spacing
const draculaDesign: DesignConfig = {
  name: 'dracula',
  spacing: {
    gap: '16',
    margin: {
      text: '8',
      card: '20',
      formGroup: '24',
      section: '40',
      item: '16',
    },
    padding: {
      item: '16',
      card: '24',
      input: '16',
      button: '16',
      section: '40',
    },
    fontSize: {
      xs: '14',
      sm: '16',
      base: '18',
      lg: '24',
      xl: '32',
      '2xl': '40',
      '3xl': '48',
    },
    lineHeight: {
      normal: '1.5',
      relaxed: '1.8',
      loose: '2',
    },
    iconSize: '24',
    inputHeight: '56',
    buttonHeight: '56',
    avatarSize: '56',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 2px 4px rgba(0,0,0,0.2)',
    md: '0 4px 8px rgba(0,0,0,0.2)',
    lg: '0 8px 16px rgba(0,0,0,0.2)',
    xl: '0 12px 24px rgba(0,0,0,0.2)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// Spotify's design system - Modern and music-focused
const spotifyDesign: DesignConfig = {
  name: 'spotify',
  spacing: {
    gap: '12',
    margin: {
      text: '6',
      card: '16',
      formGroup: '20',
      section: '32',
      item: '12',
    },
    padding: {
      item: '12',
      card: '16',
      input: '12',
      button: '12',
      section: '32',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '16',
      lg: '18',
      xl: '24',
      '2xl': '32',
      '3xl': '40',
    },
    lineHeight: {
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '24',
    inputHeight: '48',
    buttonHeight: '48',
    avatarSize: '40',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 8px 12px rgba(0,0,0,0.1)',
    xl: '0 12px 16px rgba(0,0,0,0.1)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// Studio Ghibli's design system - Whimsical and organic
const ghiblistudioDesign: DesignConfig = {
  name: 'ghiblistudio',
  spacing: {
    gap: '16',
    margin: {
      text: '8',
      card: '24',
      formGroup: '32',
      section: '48',
      item: '16',
    },
    padding: {
      item: '16',
      card: '24',
      input: '16',
      button: '16',
      section: '48',
    },
    fontSize: {
      xs: '14',
      sm: '16',
      base: '18',
      lg: '24',
      xl: '32',
      '2xl': '40',
      '3xl': '48',
    },
    lineHeight: {
      normal: '1.6',
      relaxed: '1.8',
      loose: '2',
    },
    iconSize: '24',
    inputHeight: '56',
    buttonHeight: '56',
    avatarSize: '48',
  },
  radius: {
    none: '0',
    sm: '8',
    md: '16',
    lg: '24',
    xl: '32',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 4px 8px rgba(0,0,0,0.1)',
    md: '0 8px 16px rgba(0,0,0,0.1)',
    lg: '0 12px 24px rgba(0,0,0,0.1)',
    xl: '0 16px 32px rgba(0,0,0,0.1)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

// Red-Black design system - Futuristic and high-contrast
const redblackDesign: DesignConfig = {
  name: 'redblack',
  spacing: {
    gap: '12',
    margin: {
      text: '6',
      card: '16',
      formGroup: '20',
      section: '32',
      item: '12',
    },
    padding: {
      item: '12',
      card: '16',
      input: '12',
      button: '12',
      section: '32',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '16',
      lg: '20',
      xl: '24',
      '2xl': '32',
      '3xl': '40',
    },
    lineHeight: {
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '20',
    inputHeight: '48',
    buttonHeight: '48',
    avatarSize: '40',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    xl: '16',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 2px 4px rgba(255,0,0,0.1)',
    md: '0 4px 8px rgba(255,0,0,0.2)',
    lg: '0 8px 16px rgba(255,0,0,0.3)',
    xl: '0 12px 24px rgba(255,0,0,0.4)',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
  },
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    overlay: '1030',
    modal: '1040',
    toast: '1050',
  },
};

export const designs = {
  twitter: twitterDesign,
  facebook: facebookDesign,
  whatsapp: whatsappDesign,
  dracula: draculaDesign,
  spotify: spotifyDesign,
  ghiblistudio: ghiblistudioDesign,
  redblack: redblackDesign,
} as const;

interface DesignContextType {
  design: DesignConfig;
  updateDesign: (design: DesignType) => void;
}

const DesignContext = createContext<DesignContextType | null>(null);

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}

interface DesignProviderProps {
  children: React.ReactNode;
}

export function DesignProvider({ children }: DesignProviderProps) {
  const [currentDesign, setCurrentDesign] = useState<DesignConfig>(designs.whatsapp);

  const loadSavedDesign = useCallback(() => {
    const savedDesign = localStorage.getItem('theme_design');
    if (savedDesign && designs[savedDesign as DesignType]) {
      setCurrentDesign(designs[savedDesign as DesignType]);
    }
  }, []);

  React.useEffect(() => {
    loadSavedDesign();
  }, [loadSavedDesign]);

  const updateDesign = useCallback((designType: DesignType) => {
    setCurrentDesign(designs[designType]);
    localStorage.setItem('theme_design', designType);
  }, []);

  return (
    <DesignContext.Provider value={{ design: currentDesign, updateDesign }}>
      {children}
    </DesignContext.Provider>
  );
} 