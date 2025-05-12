'use client';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, TextInput, FlatList, useWindowDimensions, SafeAreaView, ActivityIndicator, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  RotateCcw,
  ChevronDown,
  Search,
  Plus
} from 'lucide-react-native';
import { useTheme } from '~/lib/core/providers/theme/ThemeProvider';
import { createClient } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { PREMIUM_CONFIGS, global_superadmin } from '~/lib/in-app-db/states/telangana/premium-data';
import { useAuth } from '~/lib/core/contexts/AuthContext';

const supabaseUrl = 'https://risbemjewosmlvzntjkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

const supabase = createClient(supabaseUrl, supabaseKey);

interface TenantRequest {
  id: string;
  requestInfo: any;
  type: string;
  uid: string;
  username: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function RequestsTab() {
  const { username } = useLocalSearchParams();
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState<TenantRequest[]>([]);
  const { user } = useAuth();

  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827'; // Tailwind gray-900

  // Find the channel in all configs to get owner
  const findChannelOwner = () => {
    for (const [ownerUsername, config] of Object.entries(PREMIUM_CONFIGS)) {
      const channel = config?.related_channels?.find(ch => ch.username === username);
      if (channel) {
        return {
          ownerUsername,
          channel,
          config
        };
      }
    }
    return null;
  };

  const channelInfo = findChannelOwner();
  const premiumConfig = channelInfo?.config || PREMIUM_CONFIGS[username as string];
  const clientType = premiumConfig?.client_type || 'public';
  const isPublic = !premiumConfig || Object.keys(premiumConfig).length === 0 || premiumConfig.is_public;
  
  // Get user role and access
  const userRole = premiumConfig?.roles ? 
    Object.entries(premiumConfig.roles).find(([_, emails]) => 
      Array.isArray(emails) && emails.includes(user?.email || '')
    )?.[0] : null;

  const hasAccess = !premiumConfig || Object.keys(premiumConfig).length === 0 
    ? (user?.email ? user.email === global_superadmin : false) 
    : userRole !== null;

  // Load tenant requests
  useEffect(() => {
    const loadTenantRequests = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tenant_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setTenantRequests(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading tenant requests:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadTenantRequests();
  }, []);

  // Filter requests when search term or requests change
  useEffect(() => {
    if (!loading && tenantRequests && tenantRequests.length > 0) {
      const filtered = tenantRequests.filter(request => 
        JSON.stringify(request).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else if (!loading) {
      setFilteredRequests([]);
    }
  }, [searchTerm, tenantRequests, loading]);

  const handleStatusChange = async (requestId: string, action: 'approve' | 'reject' | 'reset') => {
    try {
      const { error } = await supabase
        .from('tenant_requests')
        .update({ 
          status: action === 'approve' ? 'APPROVED' : 
                 action === 'reject' ? 'REJECTED' : 'PENDING'
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh the requests list
      const { data, error: fetchError } = await supabase
        .from('tenant_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setTenantRequests(data || []);
      setError(null);
    } catch (err) {
      console.error(`Error updating tenant request status:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const renderStatusBadge = (status: string) => {
    const statusMap = {
      'APPROVED': { icon: CheckCircle, color: '#3B82F6' }, // blue-500
      'REJECTED': { icon: XCircle, color: '#EF4444' }, // red-500
      'PENDING': { icon: Clock, color: '#6B7280' } // gray-500
    };

    const { icon: Icon, color } = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    
    return (
      <View className={`flex-row items-center px-2.5 py-1.5 rounded-lg`} style={{ backgroundColor: color }}>
        <Icon size={16} color="#FFFFFF" />
        <Text className="ml-1.5 text-sm font-semibold text-white">
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Text>
      </View>
    );
  };

  const renderTableRow = (item: TenantRequest) => {
    if (isMobile) {
      return (
        <View key={item.id} className="p-4 rounded-xl mb-3 bg-white dark:bg-gray-800 shadow-sm">
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[140px]">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-gray-600 dark:text-gray-300">Channel</Text>
              <Text className="text-base leading-5 text-gray-900 dark:text-white" numberOfLines={1}>{item.username}</Text>
            </View>
            <View className="flex-1 min-w-[140px]">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-gray-600 dark:text-gray-300">Status</Text>
              {renderStatusBadge(item.status)}
            </View>
            <View className="flex-1 min-w-[140px]">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-gray-600 dark:text-gray-300">Date</Text>
              <Text className="text-base leading-5 text-gray-900 dark:text-white">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-4">
            <Button
              onPress={() => handleStatusChange(item.id, 'approve')}
              className="flex-1 min-w-[100px] flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-blue-500"
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Approve</Text>
            </Button>
            
            <Button
              onPress={() => handleStatusChange(item.id, 'reject')}
              className="flex-1 min-w-[100px] flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-red-500"
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Reject</Text>
            </Button>

            <Button
              onPress={() => handleStatusChange(item.id, 'reset')}
              className="flex-1 min-w-[100px] flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-gray-500 dark:bg-gray-600"
            >
              <RotateCcw size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Reset</Text>
            </Button>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} className="flex-row p-4 rounded-xl mb-2 bg-white dark:bg-gray-800 shadow-sm items-center">
        {/* Username Column - 25% */}
        <View className="w-1/4 pr-4">
          <Text className="text-base leading-5 text-gray-900 dark:text-white" numberOfLines={1}>{item.username}</Text>
        </View>

        {/* Status Column - 20% */}
        <View className="w-1/5 pr-4">
          {renderStatusBadge(item.status)}
        </View>

        {/* Date Column - 20% */}
        <View className="w-1/5 pr-4">
          <Text className="text-base leading-5 text-gray-900 dark:text-white">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Actions Column - 35% */}
        <View className="w-[35%] flex-row gap-2 justify-end">
          <Button
            onPress={() => handleStatusChange(item.id, 'approve')}
            className="flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-blue-500 min-w-[100px]"
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-sm font-semibold text-white">Approve</Text>
          </Button>
          
          <Button
            onPress={() => handleStatusChange(item.id, 'reject')}
            className="flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-red-500 min-w-[100px]"
          >
            <XCircle size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-sm font-semibold text-white">Reject</Text>
          </Button>

          <Button
            onPress={() => handleStatusChange(item.id, 'reset')}
            className="flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-gray-500 dark:bg-gray-600 min-w-[100px]"
          >
            <RotateCcw size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-sm font-semibold text-white">Reset</Text>
          </Button>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">Loading Requests</Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              Please wait while we load your requests
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-6">
          <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 mt-6 shadow-lg">
            <XCircle size={48} color="#EF4444" />
            <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">Error Loading Requests</Text>
            <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
              {error}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 p-6">

        {/* Search Bar */}
        <View className="flex-row items-center p-4 rounded-xl mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <Search size={20} color={iconColor} />
          <TextInput
            className="flex-1 ml-3 text-base h-10 text-gray-900 dark:text-white"
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search requests..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Table Header - Desktop Only */}
        {!isMobile && (
          <View className="flex-row px-4 mb-2">
            <View className="w-1/4 pr-4">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Username</Text>
            </View>
            <View className="w-1/5 pr-4">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</Text>
            </View>
            <View className="w-1/5 pr-4">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Date</Text>
            </View>
            <View className="w-[35%]">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Actions</Text>
            </View>
          </View>
        )}

        {/* Table Body */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map(renderTableRow)
          ) : (
            <View className="flex-1 justify-center items-center py-10">
              <View className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg w-full max-w-md">
                <FileText size={48} color={iconColor} />
                <Text className="mt-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
                  {searchTerm ? 'No Matching Requests' : 'No Requests Available'}
                </Text>
                <Text className="mt-3 text-base text-center text-gray-600 dark:text-gray-300">
                  {searchTerm ? 'Try adjusting your search terms' : 'New requests will appear here'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 