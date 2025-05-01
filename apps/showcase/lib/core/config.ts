export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '/api';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      user: {
        language: `${API_BASE_URL}/user/language`,
        notification: `${API_BASE_URL}/user/notification`,
        location: `${API_BASE_URL}/user/location`,
      },
      dashboard: {
        tenantUsers: `${API_BASE_URL}/dashboard/tenant-users`,
        tenantRequests: `${API_BASE_URL}/dashboard/tenant-requests`,
        test: `${API_BASE_URL}/dashboard/test`,
        createTables: `${API_BASE_URL}/dashboard/create-tables`,
        connectionStatus: `${API_BASE_URL}/dashboard/connection-status`,
      },
      channels: {
        base: `${API_BASE_URL}/channels`,
      },
      notifications: {
        test: `${API_BASE_URL}/notifications/test`,
        sendTest: `${API_BASE_URL}/notifications/send-test`,
      },
      follow: `${API_BASE_URL}/follow`,
      myinfo: `${API_BASE_URL}/myinfo`,
    },
  },
}; 