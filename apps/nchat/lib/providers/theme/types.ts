export type DesignType = 'whatsapp' | 'twitter' | 'facebook' | 'dracula';

export interface DesignConfig {
  name: DesignType;
  spacing: {
    gap: string;
    margin: {
      text: string;
      card: string;
    };
    padding: {
      item: string;
      card: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    lineHeight: {
      normal: string;
      relaxed: string;
      loose: string;
    };
    iconSize: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadow: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };
}

export interface ColorScheme {
  name: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

export interface Theme {
  colorScheme: ColorScheme;
  design: DesignConfig;
} 