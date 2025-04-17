export type DesignType = 'twitter' | 'facebook' | 'whatsapp' | 'dracula' | 'spotify' | 'ghiblistudio' | 'redblack' | 'material';

export interface DesignConfig {
  name: DesignType;
  spacing: {
    gap: string;
    margin: {
      text: string;
      card: string;
      formGroup: string;
      section: string;
      item: string;
    };
    padding: {
      item: string;
      card: string;
      input: string;
      button: string;
      section: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    lineHeight: {
      normal: string;
      relaxed: string;
      loose: string;
    };
    iconSize: string;
    inputHeight: string;
    buttonHeight: string;
    avatarSize: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  elevation: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  opacity: {
    disabled: string;
    subtle: string;
    medium: string;
    strong: string;
    glass: string;
  };
  zIndex: {
    base: string;
    dropdown: string;
    sticky: string;
    overlay: string;
    modal: string;
    toast: string;
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