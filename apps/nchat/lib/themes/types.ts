export interface ColorSchemeConfig {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

export interface DesignConfig {
  name: string;
  spacing: {
    padding: {
      card: string;
      item: string;
    };
    margin: {
      text: string;
    };
    gap: string;
    iconSize: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  animation: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface Theme {
  colorScheme: ColorSchemeConfig;
  design?: DesignConfig;
} 