import { LineChartData, BarChartData, PieChartData } from '~/types/charts';

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  color: string;
  metrics: {
    averageActivity: number;
    retentionRate: number;
    satisfactionScore: number;
  };
}

export interface UserAnalytics {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isVIP: boolean;
  requestStatus: 'approved' | 'pending' | 'rejected';
  sentiment: 'positive' | 'neutral' | 'negative';
  messageCount: number;
  lastViewed: string;
  tenantRequests: number;
  joinDate: string;
  churnRisk?: 'low' | 'medium' | 'high';
  tags?: string[];
  network?: {
    followers: number;
    following: number;
    referredBy?: string;
  };
  activityMetrics: {
    dailyActiveMinutes: number;
    weeklyActiveDays: number;
    monthlyEngagement: number;
    responseTime: number; // in minutes
  };
  requestHistory: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    averageResolutionTime: number;
  };
}

export interface ChannelAnalytics {
  totalViewers: number;
  activeUsers: number;
  averageMessages: number;
  totalRequests: number;
  funnelMetrics: Array<{
    stage: string;
    count: number;
    conversionRate: number;
  }>;
  agingRequests: Array<{
    status: string;
    count: number;
    averageTime: number;
  }>;
  anomalies: Array<{
    type: 'spike' | 'drop';
    metric: string;
    change: number;
    date: string;
  }>;
  slaMetrics: {
    averageResolutionTime: number;
    slaViolations: number;
    pendingOver24h: number;
  };
  growthForecast: {
    newUsers: number;
    activeUsers: number;
    requests: number;
    confidence: number;
  };
  timeSeriesData: {
    dailyActiveUsers: LineChartData;
    messageVolume: LineChartData;
    requestVolume: LineChartData;
    resolutionTime: LineChartData;
  };
  distributionData: {
    requestTypes: PieChartData;
    userSegments: PieChartData;
    timeDistribution: BarChartData;
  };
  performanceMetrics: {
    responseTime: number;
    satisfactionScore: number;
    retentionRate: number;
    engagementScore: number;
  };
}

export const MOCK_USER_SEGMENTS: UserSegment[] = [
  {
    id: '1',
    name: 'Power Users',
    description: 'Highly active users with frequent interactions',
    icon: '⚡',
    count: 150,
    color: '#10B981',
    metrics: {
      averageActivity: 85,
      retentionRate: 92,
      satisfactionScore: 4.8
    }
  },
  {
    id: '2',
    name: 'New Users',
    description: 'Recently joined users',
    icon: '🆕',
    count: 300,
    color: '#3B82F6',
    metrics: {
      averageActivity: 45,
      retentionRate: 75,
      satisfactionScore: 4.2
    }
  },
  {
    id: '3',
    name: 'At Risk',
    description: 'Users showing signs of churn',
    icon: '⚠️',
    count: 50,
    color: '#EF4444',
    metrics: {
      averageActivity: 15,
      retentionRate: 35,
      satisfactionScore: 3.1
    }
  },
  {
    id: '4',
    name: 'VIP Users',
    description: 'Premium users with special access',
    icon: '👑',
    count: 25,
    color: '#F59E0B',
    metrics: {
      averageActivity: 95,
      retentionRate: 98,
      satisfactionScore: 4.9
    }
  }
];

export const MOCK_USER_ANALYTICS: UserAnalytics[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isVIP: true,
    requestStatus: 'approved',
    sentiment: 'positive',
    messageCount: 1500,
    lastViewed: '2024-02-20T10:30:00Z',
    tenantRequests: 25,
    joinDate: '2023-01-15',
    churnRisk: 'low',
    tags: ['early-adopter', 'power-user'],
    network: {
      followers: 2500,
      following: 500,
      referredBy: 'jane_smith'
    },
    activityMetrics: {
      dailyActiveMinutes: 120,
      weeklyActiveDays: 6,
      monthlyEngagement: 95,
      responseTime: 5
    },
    requestHistory: {
      total: 25,
      approved: 20,
      pending: 3,
      rejected: 2,
      averageResolutionTime: 2.5
    }
  },
  // Add more mock users...
];

export const MOCK_CHANNEL_ANALYTICS: ChannelAnalytics = {
  totalViewers: 15000,
  activeUsers: 5000,
  averageMessages: 250,
  totalRequests: 1000,
  funnelMetrics: [
    { stage: 'New Users', count: 1000, conversionRate: 100 },
    { stage: 'Active Users', count: 800, conversionRate: 80 },
    { stage: 'Engaged Users', count: 500, conversionRate: 50 },
    { stage: 'Power Users', count: 200, conversionRate: 20 }
  ],
  agingRequests: [
    { status: 'pending', count: 50, averageTime: 12 },
    { status: 'approved', count: 800, averageTime: 24 },
    { status: 'rejected', count: 150, averageTime: 48 }
  ],
  anomalies: [
    { type: 'spike', metric: 'message_volume', change: 150, date: '2024-02-19' },
    { type: 'drop', metric: 'active_users', change: -30, date: '2024-02-18' }
  ],
  slaMetrics: {
    averageResolutionTime: 24,
    slaViolations: 15,
    pendingOver24h: 25
  },
  growthForecast: {
    newUsers: 2000,
    activeUsers: 6000,
    requests: 1200,
    confidence: 0.85
  },
  timeSeriesData: {
    dailyActiveUsers: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [4500, 4800, 5000, 4900, 5100, 5300, 5000],
          color: '#3B82F6'
        }
      ]
    },
    messageVolume: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [200, 250, 300, 280, 320, 350, 250],
          color: '#10B981'
        }
      ]
    },
    requestVolume: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [100, 120, 150, 130, 160, 180, 140],
          color: '#F59E0B'
        }
      ]
    },
    resolutionTime: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [20, 22, 25, 23, 21, 24, 22],
          color: '#EF4444'
        }
      ]
    }
  },
  distributionData: {
    requestTypes: {
      labels: ['Feature Request', 'Bug Report', 'Support', 'Feedback'],
      data: [40, 25, 20, 15],
      colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
    },
    userSegments: {
      labels: ['Power Users', 'New Users', 'At Risk', 'VIP'],
      data: [30, 40, 15, 15],
      colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B']
    },
    timeDistribution: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          data: [10, 5, 20, 30, 25, 15],
          color: '#3B82F6'
        }
      ]
    }
  },
  performanceMetrics: {
    responseTime: 15, // minutes
    satisfactionScore: 4.5, // out of 5
    retentionRate: 85, // percentage
    engagementScore: 78 // percentage
  }
}; 