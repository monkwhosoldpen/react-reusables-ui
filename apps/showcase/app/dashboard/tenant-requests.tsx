'use client';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, FlatList } from 'react-native';
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
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
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
      'APPROVED': { icon: CheckCircle, color: colorScheme.colors.primary },
      'REJECTED': { icon: XCircle, color: colorScheme.colors.notification },
      'PENDING': { icon: Clock, color: colorScheme.colors.border }
    };

    const { icon: Icon, color } = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Icon size={16} color="#FFFFFF" />
        <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.spinner} />
          <Text style={[styles.loadingText, { color: colorScheme.colors.text }]}>
            Loading tenant requests...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colorScheme.colors.notification }]}>
          <XCircle size={24} color="#FFFFFF" />
          <Text style={[styles.errorText, { color: '#FFFFFF' }]}>
            Error loading tenant requests: {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colorScheme.colors.text }]}>
          Tenant Requests
        </Text>
        <Text style={[styles.subHeaderText, { color: colorScheme.colors.text }]}>
          Manage tenant access requests
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colorScheme.colors.card }]}>
        <Search size={20} color={colorScheme.colors.text} />
        <TextInput
          style={[styles.searchInput, { color: colorScheme.colors.text }]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search requests..."
          placeholderTextColor={colorScheme.colors.text}
        />
      </View>

      {/* Table Header */}
      <View style={[styles.tableHeader, { backgroundColor: colorScheme.colors.card }]}>
        <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Username</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Type</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Status</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Date</Text>
        <Text style={[styles.tableHeaderText, { color: colorScheme.colors.text }]}>Actions</Text>
      </View>

      {/* Table Body */}
      <ScrollView style={styles.tableBody}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((item) => (
            <View key={item.id} style={[styles.tableRow, { backgroundColor: colorScheme.colors.card }]}>
              <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>{item.username}</Text>
              <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>{item.type}</Text>
              <View style={styles.tableCell}>
                {renderStatusBadge(item.status)}
              </View>
              <Text style={[styles.tableCell, { color: colorScheme.colors.text }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <View style={[styles.tableCell, styles.actionButtons]}>
                <Button
                  onPress={() => handleStatusChange(item.id, 'approve')}
                  style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
                >
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Approve</Text>
                </Button>
                
                <Button
                  onPress={() => handleStatusChange(item.id, 'reject')}
                  style={[styles.actionButton, { backgroundColor: colorScheme.colors.notification }]}
                >
                  <XCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Reject</Text>
                </Button>

                <Button
                  onPress={() => handleStatusChange(item.id, 'reset')}
                  style={[styles.actionButton, { backgroundColor: colorScheme.colors.border }]}
                >
                  <RotateCcw size={16} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Reset</Text>
                </Button>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color={colorScheme.colors.text} />
            <Text style={[styles.emptyStateText, { color: colorScheme.colors.text }]}>
              {searchTerm ? 'No matching requests found' : 'No tenant requests available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    minWidth: '30%',
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0000FF',
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
}); 