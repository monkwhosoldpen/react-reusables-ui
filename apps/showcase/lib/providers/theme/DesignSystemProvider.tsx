import React, { createContext, useContext, useState, useCallback } from 'react';
import { DesignConfig } from './types';

export type DesignType = 'whatsapp' | 'ghiblistudio' | 'redblack';

// WhatsApp's design system - Material Design with subtle curves
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
      base: '16',
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
    avatarSize: '40',
  },
  radius: {
    none: '0',
    sm: '2',
    md: '4',
    lg: '8',
    xl: '12',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.10)',
  },
  elevation: {
    none: '0',
    sm: '2',
    md: '4',
    lg: '8',
    xl: '16',
  },
  opacity: {
    disabled: '0.38',
    subtle: '0.6',
    medium: '0.7',
    strong: '0.87',
    glass: '0.92',
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
    sm: '0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)',
    md: '0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1)',
    lg: '0 12px 24px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
    xl: '0 16px 32px rgba(0,0,0,0.1), 0 12px 24px rgba(0,0,0,0.1)',
  },
  elevation: {
    none: '0',
    sm: '2',
    md: '4',
    lg: '8',
    xl: '16',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
    glass: '0.95',
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
    sm: '2',
    md: '4',
    lg: '8',
    xl: '12',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 2px 4px rgba(255,0,0,0.1), 0 1px 2px rgba(255,0,0,0.2)',
    md: '0 4px 8px rgba(255,0,0,0.2), 0 2px 4px rgba(255,0,0,0.3)',
    lg: '0 8px 16px rgba(255,0,0,0.3), 0 4px 8px rgba(255,0,0,0.4)',
    xl: '0 16px 32px rgba(255,0,0,0.4), 0 8px 16px rgba(255,0,0,0.5)',
  },
  elevation: {
    none: '0',
    sm: '2',
    md: '4',
    lg: '8',
    xl: '16',
  },
  opacity: {
    disabled: '0.4',
    subtle: '0.6',
    medium: '0.8',
    strong: '0.9',
    glass: '0.95',
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

// Material Design system - Following Material Design 3 guidelines

export const designs = {
  whatsapp: whatsappDesign,
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