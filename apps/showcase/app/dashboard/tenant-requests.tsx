'use client';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, TextInput, FlatList, useWindowDimensions } from 'react-native';
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
  Search
} from 'lucide-react-native';
import { useTheme } from '~/lib/core/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { createClient } from '@supabase/supabase-js';

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

export default function TenantRequestsPage() {
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Tablet breakpoint
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState<TenantRequest[]>([]);

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
      'APPROVED': { icon: CheckCircle, color: 'bg-primary' },
      'REJECTED': { icon: XCircle, color: 'bg-red-500' },
      'PENDING': { icon: Clock, color: 'bg-gray-500 dark:bg-gray-600' }
    };

    const { icon: Icon, color } = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    
    return (
      <View className={`flex-row items-center px-2.5 py-1.5 rounded-lg shadow-sm ${color}`}>
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
        <View key={item.id} className="p-4 rounded-xl mb-3 bg-card dark:bg-gray-800 shadow-sm">
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] mb-2">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-foreground dark:text-gray-300">Username</Text>
              <Text className="text-base leading-5 text-foreground dark:text-gray-200">{item.username}</Text>
            </View>
            <View className="flex-1 min-w-[45%] mb-2">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-foreground dark:text-gray-300">Type</Text>
              <Text className="text-base leading-5 text-foreground dark:text-gray-200">{item.type}</Text>
            </View>
            <View className="flex-1 min-w-[45%] mb-2">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-foreground dark:text-gray-300">Status</Text>
              {renderStatusBadge(item.status)}
            </View>
            <View className="flex-1 min-w-[45%] mb-2">
              <Text className="text-xs opacity-70 mb-1 uppercase tracking-wide text-foreground dark:text-gray-300">Date</Text>
              <Text className="text-base leading-5 text-foreground dark:text-gray-200">
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-3 w-full">
            <Button
              onPress={() => handleStatusChange(item.id, 'approve')}
              className="flex-row items-center py-2.5 px-3 rounded-lg flex-1 min-w-[30%] bg-primary"
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Approve</Text>
            </Button>
            
            <Button
              onPress={() => handleStatusChange(item.id, 'reject')}
              className="flex-row items-center py-2.5 px-3 rounded-lg flex-1 min-w-[30%] bg-red-500"
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Reject</Text>
            </Button>

            <Button
              onPress={() => handleStatusChange(item.id, 'reset')}
              className="flex-row items-center py-2.5 px-3 rounded-lg flex-1 min-w-[30%] bg-gray-500 dark:bg-gray-600"
            >
              <RotateCcw size={16} color="#FFFFFF" />
              <Text className="ml-1.5 text-sm font-semibold text-white">Reset</Text>
            </Button>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} className="flex-row p-4 rounded-xl mb-2 bg-card dark:bg-gray-800 shadow-sm items-center">
        <Text className="flex-1 text-base leading-5 text-foreground dark:text-gray-200">{item.username}</Text>
        <Text className="flex-1 text-base leading-5 text-foreground dark:text-gray-200">{item.type}</Text>
        <View className="flex-1">
          {renderStatusBadge(item.status)}
        </View>
        <Text className="flex-1 text-base leading-5 text-foreground dark:text-gray-200">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View className="flex-1 flex-row gap-2 justify-end">
          <Button
            onPress={() => handleStatusChange(item.id, 'approve')}
            className="flex-row items-center py-2.5 px-3 rounded-lg bg-primary"
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-sm font-semibold text-white">Approve</Text>
          </Button>
          
          <Button
            onPress={() => handleStatusChange(item.id, 'reject')}
            className="flex-row items-center py-2.5 px-3 rounded-lg bg-red-500"
          >
            <XCircle size={16} color="#FFFFFF" />
            <Text className="ml-1.5 text-sm font-semibold text-white">Reject</Text>
          </Button>

          <Button
            onPress={() => handleStatusChange(item.id, 'reset')}
            className="flex-row items-center py-2.5 px-3 rounded-lg bg-gray-500 dark:bg-gray-600"
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
      <View className="flex-1 p-5 bg-background dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <View className="w-12 h-12 rounded-full border-3 border-t-transparent mb-5" />
          <Text className="text-base opacity-70 text-foreground dark:text-gray-300">
            Loading tenant requests...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 p-5 bg-background dark:bg-gray-900">
        <View className="p-5 rounded-xl flex-row items-center mx-5 bg-red-500">
          <XCircle size={24} color="#FFFFFF" />
          <Text className="ml-3 text-base flex-1 text-white">
            Error loading tenant requests: {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5 bg-background dark:bg-gray-900">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
          Tenant Requests
        </Text>
        <Text className="text-base mt-2 opacity-70 text-foreground dark:text-gray-300">
          Manage tenant access requests
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center p-4 rounded-xl mb-6 bg-card dark:bg-gray-800 shadow-sm">
        <Search size={20} color={colorScheme.colors.text} />
        <TextInput
          className="flex-1 ml-3 text-base h-10 text-foreground dark:text-gray-200"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search requests..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Table Body */}
      <ScrollView className="flex-1">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderTableRow)
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <FileText size={48} color={colorScheme.colors.text} />
            <Text className="mt-5 text-base text-center opacity-70 text-foreground dark:text-gray-300">
              {searchTerm ? 'No matching requests found' : 'No tenant requests available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
} 