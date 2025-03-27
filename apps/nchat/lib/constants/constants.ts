import { ScrollView } from "react-native";

export const NAV_THEME = {
  light: {
    background: 'hsl(0 0% 100%)', // background
    border: 'hsl(240 5.9% 90%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(0 84.2% 60.2%)', // destructive
    primary: 'hsl(240 5.9% 10%)', // primary
    text: 'hsl(240 10% 3.9%)', // foreground
  },
  dark: {
    background: 'hsl(240 10% 3.9%)', // background
    border: 'hsl(240 3.7% 15.9%)', // border
    card: 'hsl(240 10% 3.9%)', // card
    notification: 'hsl(0 72% 51%)', // destructive
    primary: 'hsl(0 0% 98%)', // primary
    text: 'hsl(0 0% 98%)', // foreground
  },
};

export type ThemeCategory = {
  id: string;
  value: 'whatsapp' | 'discord' | 'compact';
  label: string;
};

export const THEME_CATEGORIES: ThemeCategory[] = [
  { id: 'whatsapp', value: 'whatsapp', label: 'WhatsApp' },
  { id: 'discord', value: 'discord', label: 'Discord' },
  { id: 'compact', value: 'compact', label: 'Compact' },
];


// Add mock chats at the top of the file
export interface UserChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageStatus: string;
  unreadCount: number;
  avatar: string;
  isGroup: boolean;
  isMuted: boolean;
  isOnline: boolean;
  typing: boolean;
}

// Generate a large set of mock chats
const generateMockChats = (count: number): UserChat[] => {
  const messageStatuses = ['read', 'delivered', 'sent', 'failed'];
  const timeSlots = ['9:41 AM', '10:23 AM', '11:15 AM', '12:30 PM', '1:45 PM', '2:20 PM', '3:05 PM', 'Yesterday', 'Monday', 'Tuesday'];
  const messages = [
    'Hey, how are you?',
    'Can we meet tomorrow?',
    'Did you see the latest update?',
    'I will be there in 5 minutes',
    'Thanks for your help!',
    'What do you think about the new design?',
    'Lets catch up soon',
    'Are you available for a call?',
    'Check out this link',
    'Do not forget about the meeting',
    'Have you finished the report?',
    'Great work on the project!',
    'When is the deadline?',
    'I will send you the details',
    'Can you help me with something?'
  ];

  return Array.from({ length: count }, (_, index) => {
    const isGroup = Math.random() > 0.7;
    const unreadCount = Math.random() > 0.6 ? Math.floor(Math.random() * 20) : 0;
    const typing = Math.random() > 0.9;
    const isMuted = Math.random() > 0.8;
    const isOnline = Math.random() > 0.7;

    // Generate more reliable avatar URLs
    const avatarId = (index % 50) + 1; // Keep within 1-50 range
    const avatarUrl = isGroup
      ? `https://picsum.photos/200?random=${avatarId}`
      : `https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${avatarId}.jpg`;

    return {
      id: `chat_${index}`,
      name: isGroup 
        ? `Group ${Math.floor(index / 10) + 1} - Team ${index % 10 + 1}`
        : `Contact ${index + 1}`,
      lastMessage: messages[index % messages.length],
      lastMessageTime: timeSlots[index % timeSlots.length],
      lastMessageStatus: messageStatuses[index % messageStatuses.length],
      unreadCount,
      avatar: avatarUrl,
      isGroup,
      isMuted,
      isOnline,
      typing
    };
  });
};

export const MOCK_CHATS: UserChat[] = generateMockChats(500);

// Add mock channels at the top of the file
export const MOCK_CHANNELS = [
  { _id: 'general', name: 'general', fname: 'General', t: 'c', u: { username: 'admin' } },
];

// Store scroll state per channel
export const channelScrollStates = new Map<string, {
  position: number;
  hasInitialScroll: boolean;
  lastMessageTime: number;
}>();

// Update the types at the top of the file
export type MessageUser = {
  _id: string;
  username: string;
  name: string;
};

export type MessageMD = {
  type: 'PARAGRAPH';
  value: Array<{
    type: 'PLAIN_TEXT';
    value: string;
  }>;
};

export type SubchannelMessage = {
  _id: string;
  rid: string;
  msg: string;
  ts: string;
  u: MessageUser;
  unread: boolean;
  _updatedAt: string;
  urls: any[];
  mentions: any[];
  channels: any[];
  md: MessageMD[];
};

export type APIResponse = {
  success: boolean;
  messages: SubchannelMessage[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasMore: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
  metadata: {
    username: string;
    rid: string;
    fetchedAt: string;
  };
};

// Add these component definitions before the main ChatScreen component

export type NonPremiumChatProps = {
  onUpgradePress: () => void;
};

export type ChannelSidebarProps = {
  channels: any[];
  activeChannelId: string | null;
  onChannelPress: (channelId: string) => void;
  isPremium: boolean;
};

export type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  channelName?: string;
  isConnected: boolean;
};

export type MessagesProps = {
  messages: SubchannelMessage[];
  channel: {
    _id: string;
    u: {
      username: string;
    };
  } | null;
  scrollViewRef: React.RefObject<ScrollView>;
  onScroll: (event: any) => void;
  onContentSizeChange: () => void;
};

export interface Goat {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

export const MOCK_GOATS = Array.from({ length: 50 }, (_, index) => {
  const avatarId = index + 1;
  return {
    id: `goat_${index}`,
    name: `Goat ${index + 1}`,
    avatar: `https://randomuser.me/api/portraits/${index % 2 ? 'men' : 'women'}/${avatarId}.jpg`,
    status: Math.random() > 0.7 ? 'online' : 'offline'
  };
});

// Add mock news data
export interface NewsStory {
  id: string;
  title: string;
  source: string;
  time: string;
  image?: string;
  author?: string;
  relatedStories?: {
    title: string;
    source: string;
    time: string;
    author?: string;
  }[];
}

export interface WeatherInfo {
  city: string;
  currentTemp: string;
  source: string;
  forecast: {
    day: string;
    high: string;
    low: string;
  }[];
}

export interface MockNews {
  weather: WeatherInfo;
  topStories: NewsStory[];
  localNews: NewsStory[];
  picksForYou: NewsStory[];
  forYou: NewsStory[];
  india: NewsStory[];
  technology: NewsStory[];
  science: NewsStory[];
  robotics: NewsStory[];
  digitalCurrencies: NewsStory[];
  gadgets: NewsStory[];
  factCheck: NewsStory[];
  showcase: {
    source: string;
    time: string;
    headlines: {
      category: string;
      title: string;
    }[];
  }[];
}

export const MOCK_NEWS: MockNews = {
  weather: {
    city: "Hyderabad",
    currentTemp: "21°C",
    source: "weather.com",
    forecast: [
      { day: "Today", high: "26°", low: "21°" },
      { day: "Thu", high: "27°", low: "20°" },
      { day: "Fri", high: "28°", low: "18°" },
      { day: "Sat", high: "29°", low: "18°" }
    ]
  },
  topStories: [
    {
      id: "1",
      title: "Pushpa 2 stampede case: Allu Arjun's bouncer arrested; accused of pushing fans outside theatre",
      source: "Times of India",
      time: "8h",
      image: "https://static.toiimg.com/photo/104730390.cms",
      relatedStories: [
        {
          title: "Pushpa 2 stampede case: What cops asked actor Allu Arjun in 4 hours of questioning",
          source: "Business Today",
          time: "9h"
        },
        {
          title: "Trying to show he is bigger superstar: K Annamalai hits out at Revanth Reddy for bullying Allu Arjun",
          source: "The Hindu",
          time: "8h"
        },
        {
          title: "Allu Arjun stampede case: Actor appears before Chikkadpally police for quizzing on stampede during Pushpa-2",
          source: "The Hindu",
          time: "15h",
          author: "Lavpreet Kaur"
        }
      ]
    },
    {
      id: "2",
      title: "Five army soldiers killed, several injured in road accident in J&K's Poonch",
      source: "Greater Kashmir",
      time: "7h"
    }
  ],
  localNews: [
    {
      id: "l1",
      title: "Decision on T BJP chief likely in Jan",
      source: "Times of India",
      time: "2h",
      author: "Sribala Vadlapatla"
    },
    {
      id: "l2",
      title: "Police file chargesheet against Jani Master in rape case",
      source: "Deccan Chronicle",
      time: "2h"
    },
    {
      id: "l3",
      title: "CM to talk to film industry bigwigs soon, says Dil Raju",
      source: "Times of India",
      time: "2h"
    }
  ],
  picksForYou: [
    {
      id: "p1",
      title: "She's Building A No-Code CRM And Workflow Automation Empire",
      source: "Forbes",
      time: "2d",
      author: "Geri Stengel"
    },
    {
      id: "p2",
      title: "Meta's 2025 vision: Ray-Ban Smart Glasses to get built-in display, report suggests",
      source: "Mint",
      time: "3h"
    }
  ],
  technology: [
    {
      id: "t1",
      title: "Apple iPhone 15 And iPhone 15 Pro Get Massive Discounts During Flipkart Sale",
      source: "Mashable India",
      time: "10h",
      author: "Omair Pall"
    },
    {
      id: "t2",
      title: "Vivo Y29 5G launched with 5500 mAh battery and 50 MP AI camera",
      source: "GSMArena",
      time: "11h"
    }
  ],
  science: [
    {
      id: "s1",
      title: "NASA astronauts share special Christmas holiday message from International Space Station",
      source: "MSN",
      time: "4h"
    },
    {
      id: "s2",
      title: "NISAR Satellite Set To Revolutionize Earth Monitoring in 2025",
      source: "SciTechDaily",
      time: "2h"
    }
  ],
  robotics: [
    {
      id: "r1",
      title: "Iron Man robot that helps paraplegics walk",
      source: "Korea Herald",
      time: "18h"
    },
    {
      id: "r2",
      title: "Ex-Huawei recruit's startup began mass production of humanoid robots",
      source: "Nikkei Asia",
      time: "2d",
      author: "Emiko Matsui"
    }
  ],
  factCheck: [
    {
      id: "f1",
      title: "Fact Check: Visuals Of Old Protests in Austria Falsely Linked To Christmas Market Attack in Germany",
      source: "Newschecker",
      time: "2d",
      author: "Pankaj Menon and Vasudha Beri"
    },
    {
      id: "f2",
      title: "Fact Check: Did Arvind Kejriwal insult Constitution and Ambedkar? This video is edited",
      source: "India Today",
      time: "2d",
      author: "Pathikrit Sanyal"
    }
  ],
  showcase: [
    {
      source: "Times Now",
      time: "7h",
      headlines: [
        {
          category: "Pushpa 2 Stampede",
          title: "CCTV Footage Shows Victim's Final Moments At Theatre - Exclusive"
        },
        {
          category: "US News",
          title: "Indian Drugs Smuggler Shot Dead Allegedly By Bishnoi Gang In US"
        }
      ]
    },
    {
      source: "India Today",
      time: "4h",
      headlines: [
        {
          category: "JAMMU & KASHMIR",
          title: "5 soldiers dead after Army vehicle plunges into gorge in Poonch"
        },
        {
          category: "HYDERABAD STAMPEDE",
          title: "Allu Arjun grilled for 4 hours, said knew about death next day"
        }
      ]
    }
  ],
  forYou: [],
  india: [],
  digitalCurrencies: [],
  gadgets: []
};

// Channel Categories
export const CHANNEL_CATEGORIES = {
  CRICKET: 'cricket',
  FOOTBALL: 'football',
  BASKETBALL: 'basketball',
  TENNIS: 'tennis',
  BASEBALL: 'baseball',
  HOCKEY: 'hockey',
  GOLF: 'golf',
  RUGBY: 'rugby',
  SOCCER: 'soccer',
  OTHER: 'other',
} as const;

export type ChannelCategory = typeof CHANNEL_CATEGORIES[keyof typeof CHANNEL_CATEGORIES];

export const CHANNEL_CATEGORY_LABELS: Record<ChannelCategory, string> = {
  [CHANNEL_CATEGORIES.CRICKET]: 'Cricket',
  [CHANNEL_CATEGORIES.FOOTBALL]: 'Football',
  [CHANNEL_CATEGORIES.BASKETBALL]: 'Basketball',
  [CHANNEL_CATEGORIES.TENNIS]: 'Tennis',
  [CHANNEL_CATEGORIES.BASEBALL]: 'Baseball',
  [CHANNEL_CATEGORIES.HOCKEY]: 'Hockey',
  [CHANNEL_CATEGORIES.GOLF]: 'Golf',
  [CHANNEL_CATEGORIES.RUGBY]: 'Rugby',
  [CHANNEL_CATEGORIES.SOCCER]: 'Soccer',
  [CHANNEL_CATEGORIES.OTHER]: 'Other',
};

// News Categories
export const NEWS_CATEGORIES = {
  showcase: [
    {
      source: "Times Now",
      time: "7h",
      headlines: [
        {
          category: "Pushpa 2 Stampede",
          title: "CCTV Footage Shows Victim's Final Moments At Theatre - Exclusive"
        },
        {
          category: "US News",
          title: "Indian Drugs Smuggler Shot Dead Allegedly By Bishnoi Gang In US"
        }
      ]
    },
    {
      source: "India Today",
      time: "4h",
      headlines: [
        {
          category: "JAMMU & KASHMIR",
          title: "5 soldiers dead after Army vehicle plunges into gorge in Poonch"
        },
        {
          category: "HYDERABAD STAMPEDE",
          title: "Allu Arjun grilled for 4 hours, said knew about death next day"
        }
      ]
    }
  ],
  forYou: [],
  india: [],
  digitalCurrencies: [],
  gadgets: []
};