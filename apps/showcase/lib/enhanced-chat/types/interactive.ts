export type InteractiveElementType = 
  | 'poll'
  | 'survey'
  | 'quiz'
  | 'canvas'
  | 'game'
  | 'form'
  | 'chart'
  | 'map'
  | 'calendar'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'custom';

export type InteractiveElementState = 'initial' | 'active' | 'completed' | 'expired';

export type InteractiveElementOption = {
  id: string;
  type: 'text' | 'image' | 'color' | 'number' | 'date' | 'file' | 'custom';
  value: any;
  metadata?: Record<string, any>;
};

export type InteractiveElementAction = {
  type: string;
  payload?: any;
  metadata?: Record<string, any>;
  timestamp: string;
};

export type InteractiveElementResponse = {
  type: string;
  value: any;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type InteractiveElementConfig = {
  allowMultiple?: boolean;
  timeLimit?: number;
  expiresAt?: string;
  isAnonymous?: boolean;
  required?: boolean;
  validation?: {
    rules: Record<string, any>;
    messages: Record<string, string>;
  };
  styling?: {
    theme?: 'light' | 'dark' | 'custom';
    colors?: Record<string, string>;
    customCSS?: string;
  };
  layout?: {
    type: 'default' | 'grid' | 'list' | 'custom';
    config?: Record<string, any>;
  };
};

export type InteractiveElement = {
  id: string;
  type: InteractiveElementType;
  title?: string;
  description?: string;
  state: InteractiveElementState;
  options: InteractiveElementOption[];
  config: InteractiveElementConfig;
  responses: InteractiveElementResponse[];
  actions: InteractiveElementAction[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    stats?: {
      participantCount: number;
      responseCount: number;
      completionRate?: number;
      averageScore?: number;
    };
    customData?: Record<string, any>;
  };
  renderer?: {
    type: 'native' | 'webview' | 'custom';
    component?: string;
    props?: Record<string, any>;
    webviewUrl?: string;
    scriptUrl?: string;
  };
};

// Helper type for custom renderers
export type InteractiveElementRenderer<T extends InteractiveElement> = {
  render: (element: T, props: any) => React.ReactNode;
  handleAction: (element: T, action: InteractiveElementAction) => void;
  validate?: (element: T, response: InteractiveElementResponse) => boolean;
  getState?: (element: T) => InteractiveElementState;
}; 