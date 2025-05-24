import { View, Text, ScrollView, Image, Pressable, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MOCK_USER_SEGMENTS, MOCK_USER_ANALYTICS, MOCK_CHANNEL_ANALYTICS } from '~/constants/mockAnalytics';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { 
  formatRelativeTime, 
  formatNumber, 
  formatPercentage, 
  getSentimentColor,
  getChurnRiskColor,
  formatDuration
} from '~/utils/ai-user-analytics-utils';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#3B82F6'
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#E5E7EB',
    strokeDasharray: '5, 5',
  },
  useShadowColorFromDataset: false,
  web: {
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
      onStartShouldSetResponder: undefined,
      onResponderTerminationRequest: undefined,
      onResponderGrant: undefined,
      onResponderMove: undefined,
      onResponderRelease: undefined,
      onResponderTerminate: undefined
    }
  }
};

export default function AIUserAnalyticsTab() {
  const { username } = useLocalSearchParams();

  const renderHeader = () => (
    <View className="flex-row justify-between items-center mb-6">
      <View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          AI User Analytics
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Channel: {username}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center">
          <Ionicons name="download-outline" size={20} color="white" />
          <Text className="text-white ml-2">Export</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg flex-row items-center">
          <Ionicons name="refresh-outline" size={20} color="#6B7280" />
          <Text className="text-gray-600 dark:text-gray-400 ml-2">Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchAndFilters = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row items-center mb-4">
        <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className="text-gray-500 ml-2">Search users, segments, or metrics...</Text>
        </View>
        <TouchableOpacity className="ml-2 p-2">
          <Ionicons name="options-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6B7280" className="mr-1" />
            <Text>Last 7 Days</Text>
          </View>
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6B7280" className="mr-1" />
            <Text>All Segments</Text>
          </View>
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          <View className="flex-row items-center">
            <Ionicons name="trending-up-outline" size={16} color="#6B7280" className="mr-1" />
            <Text>Growth Metrics</Text>
          </View>
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          <View className="flex-row items-center">
            <Ionicons name="alert-outline" size={16} color="#6B7280" className="mr-1" />
            <Text>Show Anomalies</Text>
          </View>
        </Badge>
      </View>
    </Card>
  );

  const renderQuickActions = () => (
    <View className="flex-row flex-wrap gap-4 mb-6">
      <Card className="flex-1 p-4 min-w-[200px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">Pending Requests</Text>
            <Text className="text-2xl font-bold mt-1">50</Text>
          </View>
          <TouchableOpacity className="bg-blue-500 p-2 rounded-lg">
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Card>
      <Card className="flex-1 p-4 min-w-[200px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">New Users Today</Text>
            <Text className="text-2xl font-bold mt-1">25</Text>
          </View>
          <TouchableOpacity className="bg-green-500 p-2 rounded-lg">
            <Ionicons name="person-add-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Card>
      <Card className="flex-1 p-4 min-w-[200px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">At Risk Users</Text>
            <Text className="text-2xl font-bold mt-1">12</Text>
          </View>
          <TouchableOpacity className="bg-red-500 p-2 rounded-lg">
            <Ionicons name="warning-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderExportOptions = () => (
    <Card className="p-4 mb-6">
      <Text className="text-lg font-semibold mb-4">Export Options</Text>
      <View className="flex-row flex-wrap gap-4">
        <TouchableOpacity className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={24} color="#6B7280" />
            <View className="ml-3">
              <Text className="font-medium">CSV Export</Text>
              <Text className="text-sm text-gray-500">User Analytics</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="bar-chart-outline" size={24} color="#6B7280" />
            <View className="ml-3">
              <Text className="font-medium">PDF Report</Text>
              <Text className="text-sm text-gray-500">Channel Analytics</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 min-w-[150px] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="analytics-outline" size={24} color="#6B7280" />
            <View className="ml-3">
              <Text className="font-medium">JSON Data</Text>
              <Text className="text-sm text-gray-500">Raw Analytics</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderUserSegment = (segment: typeof MOCK_USER_SEGMENTS[0]) => (
    <Card key={segment.id} className="p-4 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{segment.icon}</Text>
          <View>
            <Text className="text-lg font-semibold">{segment.name}</Text>
            <Text className="text-sm text-gray-500">{segment.description}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Text>{segment.count} users</Text>
          </Badge>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row justify-between mt-2">
        <View>
          <Text className="text-xs text-gray-500">Activity</Text>
          <Text className="text-sm font-medium">{segment.metrics.averageActivity}%</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Retention</Text>
          <Text className="text-sm font-medium">{segment.metrics.retentionRate}%</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Satisfaction</Text>
          <Text className="text-sm font-medium">{segment.metrics.satisfactionScore}/5</Text>
        </View>
      </View>
    </Card>
  );

  const renderUserCard = (user: typeof MOCK_USER_ANALYTICS[0]) => (
    <Card key={user.id} className="p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <Image 
          source={{ uri: user.avatar }} 
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold mr-2">{user.username}</Text>
            {user.isVIP && <Text className="text-yellow-500">👑</Text>}
          </View>
          <Text className="text-sm text-gray-500">{user.email}</Text>
        </View>
        <View className="flex-row gap-2">
          <Badge 
            variant={user.requestStatus === 'approved' ? 'default' : 
                    user.requestStatus === 'pending' ? 'secondary' : 'destructive'}
          >
            <Text>{user.requestStatus}</Text>
          </Badge>
          <Badge 
            variant={user.sentiment === 'positive' ? 'default' : 
                    user.sentiment === 'neutral' ? 'secondary' : 'destructive'}
          >
            <Text>{user.sentiment === 'positive' ? '🟢' : user.sentiment === 'neutral' ? '🟠' : '🔴'}</Text>
          </Badge>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">Messages: {formatNumber(user.messageCount)}</Text>
        <Text className="text-sm text-gray-600">
          Last active: {formatRelativeTime(user.lastViewed)}
        </Text>
      </View>

      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-600">Requests: {user.tenantRequests}</Text>
        <Text className="text-sm text-gray-600">Joined: {user.joinDate}</Text>
      </View>

      {user.churnRisk && (
        <View className="mt-2">
          <Text className="text-sm font-medium mb-1">Churn Risk: 
            <Text style={{ color: getChurnRiskColor(user.churnRisk) }}>
              {' '}{user.churnRisk.toUpperCase()}
            </Text>
          </Text>
        </View>
      )}

      <View className="mt-3">
        <Text className="text-sm font-medium mb-2">Activity Metrics</Text>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-500">Daily Active</Text>
            <Text className="text-sm">{user.activityMetrics.dailyActiveMinutes}m</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Weekly Active</Text>
            <Text className="text-sm">{user.activityMetrics.weeklyActiveDays}d</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Engagement</Text>
            <Text className="text-sm">{user.activityMetrics.monthlyEngagement}%</Text>
          </View>
        </View>
      </View>

      {user.tags && user.tags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {user.tags.map(tag => (
            <Badge key={tag} variant="outline" className="px-2 py-1">
              <Text>{tag}</Text>
            </Badge>
          ))}
        </View>
      )}

      {user.network && (
        <View className="mt-2">
          <Text className="text-sm text-gray-600">
            Network: {formatNumber(user.network.followers)} followers • {formatNumber(user.network.following)} following
            {user.network.referredBy && ` • Referred by ${user.network.referredBy}`}
          </Text>
        </View>
      )}

      <View className="flex-row justify-end mt-4 gap-2">
        <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          <Text className="text-gray-600 dark:text-gray-400">View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-blue-500 px-3 py-1 rounded-lg">
          <Text className="text-white">Take Action</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderTimeSeriesChart = (data: typeof MOCK_CHANNEL_ANALYTICS.timeSeriesData.dailyActiveUsers) => {
    const chartProps = {
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0].data,
          color: (opacity = 1) => data.datasets[0].color
        }]
      },
      width: screenWidth - 32,
      height: 220,
      chartConfig: {
        ...chartConfig,
        propsForDots: Platform.select({
          web: {
            r: '6',
            strokeWidth: '2',
            stroke: '#3B82F6'
          },
          default: chartConfig.propsForDots
        })
      },
      bezier: true,
      style: {
        marginVertical: 8,
        borderRadius: 16
      }
    };

    return <LineChart {...chartProps} />;
  };

  const renderPieChart = (data: typeof MOCK_CHANNEL_ANALYTICS.distributionData.requestTypes) => {
    const chartProps = {
      data: data.labels.map((label, index) => ({
        name: label,
        population: data.data[index],
        color: data.colors[index],
        legendFontColor: '#7F9C9F',
        legendFontSize: 12
      })),
      width: screenWidth - 32,
      height: 220,
      chartConfig: {
        ...chartConfig,
        propsForDots: Platform.select({
          web: {
            r: '6',
            strokeWidth: '2',
            stroke: '#3B82F6'
          },
          default: chartConfig.propsForDots
        })
      },
      accessor: "population",
      backgroundColor: "transparent",
      paddingLeft: "15",
      absolute: true
    };

    return <PieChart {...chartProps} />;
  };

  const renderBarChart = (data: typeof MOCK_CHANNEL_ANALYTICS.distributionData.timeDistribution) => {
    const chartProps = {
      data: {
        labels: data.labels,
        datasets: [{
          data: data.datasets[0].data,
          color: (opacity = 1) => data.datasets[0].color
        }]
      },
      width: screenWidth - 32,
      height: 220,
      chartConfig: {
        ...chartConfig,
        propsForDots: Platform.select({
          web: {
            r: '6',
            strokeWidth: '2',
            stroke: '#3B82F6'
          },
          default: chartConfig.propsForDots
        })
      },
      style: {
        marginVertical: 8,
        borderRadius: 16
      },
      yAxisLabel: "",
      yAxisSuffix: "",
      showValuesOnTopOfBars: true
    };

    return <BarChart {...chartProps} />;
  };

  const renderChannelStats = () => (
    <View className="flex-row flex-wrap justify-between mb-6">
      <Card className="w-[48%] p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Total Viewers</Text>
            <Text className="text-2xl font-bold">{formatNumber(MOCK_CHANNEL_ANALYTICS.totalViewers)}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {formatPercentage(MOCK_CHANNEL_ANALYTICS.performanceMetrics.retentionRate)} retention
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
      <Card className="w-[48%] p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Active Users</Text>
            <Text className="text-2xl font-bold">{formatNumber(MOCK_CHANNEL_ANALYTICS.activeUsers)}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {formatPercentage(MOCK_CHANNEL_ANALYTICS.performanceMetrics.engagementScore)} engagement
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
      <Card className="w-[48%] p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Avg Messages</Text>
            <Text className="text-2xl font-bold">{formatNumber(MOCK_CHANNEL_ANALYTICS.averageMessages)}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {formatDuration(MOCK_CHANNEL_ANALYTICS.performanceMetrics.responseTime)} avg response
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
      <Card className="w-[48%] p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm text-gray-500 mb-1">Total Requests</Text>
            <Text className="text-2xl font-bold">{formatNumber(MOCK_CHANNEL_ANALYTICS.totalRequests)}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {formatPercentage(MOCK_CHANNEL_ANALYTICS.performanceMetrics.satisfactionScore * 20)} satisfaction
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderFunnelMetrics = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">User Lifecycle Funnel</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {MOCK_CHANNEL_ANALYTICS.funnelMetrics.map((stage, index) => (
        <View key={stage.stage} className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-medium">{stage.stage}</Text>
            <Text className="text-sm text-gray-500">{stage.conversionRate}%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${stage.conversionRate}%` }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">{stage.count} users</Text>
        </View>
      ))}
    </Card>
  );

  const renderAgingRequests = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Request Aging</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {MOCK_CHANNEL_ANALYTICS.agingRequests.map(request => (
        <View key={request.status} className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium capitalize">{request.status}</Text>
            <Badge variant="secondary">
              <Text>{request.count} requests</Text>
            </Badge>
          </View>
          <Text className="text-sm text-gray-500">
            Avg. time: {formatDuration(request.averageTime)}
          </Text>
        </View>
      ))}
    </Card>
  );

  const renderAnomalies = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Recent Anomalies</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {MOCK_CHANNEL_ANALYTICS.anomalies.map((anomaly, index) => (
        <View key={index} className="mb-3">
          <View className="flex-row items-center">
            <Text className={`text-xl mr-2 ${anomaly.type === 'spike' ? 'text-green-500' : 'text-red-500'}`}>
              {anomaly.type === 'spike' ? '📈' : '📉'}
            </Text>
            <View>
              <Text className="text-sm font-medium capitalize">
                {anomaly.metric.replace('_', ' ')}
              </Text>
              <Text className="text-sm text-gray-500">
                {formatPercentage(anomaly.change)} on {anomaly.date}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  );

  const renderSLAMetrics = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">SLA Metrics</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-sm font-medium">Avg Resolution Time</Text>
          <Text className="text-sm text-gray-500">{formatDuration(MOCK_CHANNEL_ANALYTICS.slaMetrics.averageResolutionTime)}</Text>
        </View>
        <View>
          <Text className="text-sm font-medium">SLA Violations</Text>
          <Text className="text-sm text-gray-500">{MOCK_CHANNEL_ANALYTICS.slaMetrics.slaViolations}</Text>
        </View>
        <View>
          <Text className="text-sm font-medium">Pending {'>'} 24h</Text>
          <Text className="text-sm text-gray-500">{MOCK_CHANNEL_ANALYTICS.slaMetrics.pendingOver24h}</Text>
        </View>
      </View>
    </Card>
  );

  const renderGrowthForecast = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Growth Forecast</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4">
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium">New Users</Text>
            <Badge variant="default">
              <Text>{MOCK_CHANNEL_ANALYTICS.growthForecast.newUsers}</Text>
            </Badge>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">Expected new user growth</Text>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium">Active Users</Text>
            <Badge variant="secondary">
              <Text>{MOCK_CHANNEL_ANALYTICS.growthForecast.activeUsers}</Text>
            </Badge>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">Projected active user count</Text>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium">Requests</Text>
            <Badge variant="outline">
              <Text>{MOCK_CHANNEL_ANALYTICS.growthForecast.requests}</Text>
            </Badge>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">Anticipated request volume</Text>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium">Confidence</Text>
            <Badge variant="secondary">
              <Text>{formatPercentage(MOCK_CHANNEL_ANALYTICS.growthForecast.confidence)}</Text>
            </Badge>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">Forecast confidence level</Text>
        </View>
      </View>
    </Card>
  );

  const renderInsightsPanel = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">AI Insights</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="refresh-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4">
        <View className="flex-row items-start">
          <View className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
            <Ionicons name="trending-up" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="font-medium">User Engagement Spike</Text>
            <Text className="text-sm text-gray-500">Active users increased by 25% in the last 24 hours</Text>
            <Text className="text-xs text-blue-500 mt-1">View Details →</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg mr-3">
            <Ionicons name="warning" size={24} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="font-medium">Churn Risk Alert</Text>
            <Text className="text-sm text-gray-500">12 users showing high churn risk indicators</Text>
            <Text className="text-xs text-yellow-500 mt-1">Take Action →</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="font-medium">Performance Milestone</Text>
            <Text className="text-sm text-gray-500">Response time improved by 40% this week</Text>
            <Text className="text-xs text-green-500 mt-1">View Report →</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderUserActivityTimeline = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Recent Activity</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4">
        {MOCK_USER_ANALYTICS.slice(0, 3).map((user, index) => (
          <View key={user.id} className="flex-row">
            <View className="w-8 flex items-center">
              <View className="w-2 h-2 rounded-full bg-blue-500" />
              {index < 2 && <View className="w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />}
            </View>
            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <Image source={{ uri: user.avatar }} className="w-8 h-8 rounded-full mr-2" />
                <View>
                  <Text className="font-medium">{user.username}</Text>
                  <Text className="text-sm text-gray-500">{formatRelativeTime(user.lastViewed)}</Text>
                </View>
              </View>
              <View className="mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <Text className="text-sm">
                  {user.messageCount > 100 ? 'High activity user' : 'Regular user'} • 
                  {user.tenantRequests} requests • 
                  {user.sentiment === 'positive' ? 'Positive sentiment' : 'Neutral sentiment'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Performance Metrics</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="grid grid-cols-2 gap-4">
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text className="text-sm text-gray-500 mb-1">Response Time</Text>
          <Text className="text-2xl font-bold">{formatDuration(MOCK_CHANNEL_ANALYTICS.performanceMetrics.responseTime)}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="trending-down" size={16} color="#10B981" />
            <Text className="text-sm text-green-500 ml-1">-15% from last week</Text>
          </View>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text className="text-sm text-gray-500 mb-1">Satisfaction Score</Text>
          <Text className="text-2xl font-bold">{MOCK_CHANNEL_ANALYTICS.performanceMetrics.satisfactionScore}/5</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text className="text-sm text-green-500 ml-1">+0.5 from last month</Text>
          </View>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text className="text-sm text-gray-500 mb-1">Engagement Rate</Text>
          <Text className="text-2xl font-bold">{formatPercentage(MOCK_CHANNEL_ANALYTICS.performanceMetrics.engagementScore)}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text className="text-sm text-green-500 ml-1">+8% from last week</Text>
          </View>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <Text className="text-sm text-gray-500 mb-1">Retention Rate</Text>
          <Text className="text-2xl font-bold">{formatPercentage(MOCK_CHANNEL_ANALYTICS.performanceMetrics.retentionRate)}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text className="text-sm text-green-500 ml-1">+5% from last month</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderCharts = () => (
    <View className="mb-6">
      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Daily Active Users</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {renderTimeSeriesChart(MOCK_CHANNEL_ANALYTICS.timeSeriesData.dailyActiveUsers)}
      </Card>

      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Message Volume</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {renderTimeSeriesChart(MOCK_CHANNEL_ANALYTICS.timeSeriesData.messageVolume)}
      </Card>

      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Request Types Distribution</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {renderPieChart(MOCK_CHANNEL_ANALYTICS.distributionData.requestTypes)}
      </Card>

      <Card className="p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">User Activity by Time</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {renderBarChart(MOCK_CHANNEL_ANALYTICS.distributionData.timeDistribution)}
      </Card>
    </View>
  );
  
  const renderUserSegments = () => (
    <Card className="p-4 mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">User Segments</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="space-y-4">
        {MOCK_CHANNEL_ANALYTICS.distributionData.userSegments.labels.map((segment, index) => (
          <View key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium">{segment}</Text>
              <Badge variant="secondary">
                <Text>{MOCK_CHANNEL_ANALYTICS.distributionData.userSegments.data[index]}%</Text>
              </Badge>
            </View>
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${MOCK_CHANNEL_ANALYTICS.distributionData.userSegments.data[index]}%`,
                  backgroundColor: MOCK_CHANNEL_ANALYTICS.distributionData.userSegments.colors[index]
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {renderHeader()}
        {renderSearchAndFilters()}
        {renderQuickActions()}
        {renderInsightsPanel()}
        {renderChannelStats()}
        {renderCharts()}
        {renderPerformanceMetrics()}
        {renderExportOptions()}
        {renderFunnelMetrics()}
        {renderAgingRequests()}
        {renderSLAMetrics()}
        {renderAnomalies()}
        {renderGrowthForecast()}
        {renderUserActivityTimeline()}
        {renderUserSegments()}

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
          Recent Users
        </Text>
        {MOCK_USER_ANALYTICS.map(renderUserCard)}
      </View>
    </ScrollView>
  );
} 