import React, { createContext, useContext, useState, useCallback } from 'react';
import { useStorage } from '../storage/StorageProvider';
import { DesignType, DesignConfig } from './types';

// Twitter's design system - Clean and professional
const twitterDesign: DesignConfig = {
  name: 'twitter',
  spacing: {
    gap: '8',
    margin: {
      text: '4',
      card: '12',
    },
    padding: {
      item: '12',
      card: '16',
    },
    fontSize: {
      xs: '13',
      sm: '14',
      base: '15',
      lg: '16',
      xl: '20',
    },
    lineHeight: {
      normal: '1.3',
      relaxed: '1.5',
      loose: '1.8',
    },
    iconSize: '20',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '8',
    lg: '12',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 2px 4px rgba(0,0,0,0.1)',
    lg: '0 4px 8px rgba(0,0,0,0.1)',
  },
};

// Facebook's design system - Neutral and balanced
const facebookDesign: DesignConfig = {
  name: 'facebook',
  spacing: {
    gap: '12',
    margin: {
      text: '6',
      card: '16',
    },
    padding: {
      item: '12',
      card: '16',
    },
    fontSize: {
      xs: '12',
      sm: '13',
      base: '15',
      lg: '17',
      xl: '20',
    },
    lineHeight: {
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '20',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '6',
    lg: '8',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 2px 4px rgba(0,0,0,0.1)',
    lg: '0 4px 6px rgba(0,0,0,0.1)',
  },
};

// WhatsApp's design system - Functional and conversational
const whatsappDesign: DesignConfig = {
  name: 'whatsapp',
  spacing: {
    gap: '8',
    margin: {
      text: '4',
      card: '12',
    },
    padding: {
      item: '12',
      card: '16',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '15',
      lg: '16',
      xl: '20',
    },
    lineHeight: {
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8',
    },
    iconSize: '24',
  },
  radius: {
    none: '0',
    sm: '4',
    md: '6',
    lg: '8',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 4px 6px rgba(0,0,0,0.12)',
  },
};

// Dracula's design system - Bold and vibrant
const draculaDesign: DesignConfig = {
  name: 'dracula',
  spacing: {
    gap: '16',
    margin: {
      text: '8',
      card: '20',
    },
    padding: {
      item: '16',
      card: '24',
    },
    fontSize: {
      xs: '12',
      sm: '14',
      base: '16',
      lg: '20',
      xl: '24',
    },
    lineHeight: {
      normal: '1.5',
      relaxed: '1.8',
      loose: '2',
    },
    iconSize: '24',
  },
  radius: {
    none: '0',
    sm: '8',
    md: '16',
    lg: '24',
    full: '9999',
  },
  shadow: {
    none: '0 0 0 rgba(0,0,0,0)',
    sm: '0 4px 8px rgba(0,0,0,0.2)',
    md: '0 6px 12px rgba(0,0,0,0.2)',
    lg: '0 8px 16px rgba(0,0,0,0.2)',
  },
};

export const designs = {
  twitter: twitterDesign,
  facebook: facebookDesign,
  whatsapp: whatsappDesign,
  dracula: draculaDesign,
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
  const { getItem, setItem } = useStorage();
  const [currentDesign, setCurrentDesign] = useState<DesignConfig>(designs.whatsapp);

  const loadSavedDesign = useCallback(async () => {
    const savedDesign = await getItem('theme_design');
    if (savedDesign && designs[savedDesign as DesignType]) {
      setCurrentDesign(designs[savedDesign as DesignType]);
    }
  }, [getItem]);

  React.useEffect(() => {
    loadSavedDesign();
  }, [loadSavedDesign]);

  const updateDesign = useCallback(async (designType: DesignType) => {
    setCurrentDesign(designs[designType]);
    await setItem('theme_design', designType);
  }, [setItem]);

  return (
    <DesignContext.Provider value={{ design: currentDesign, updateDesign }}>
      {children}
    </DesignContext.Provider>
  );
} 