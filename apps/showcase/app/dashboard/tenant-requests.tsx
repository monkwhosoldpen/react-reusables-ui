'use client';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, FlatList, useWindowDimensions } from 'react-native';
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

  const renderTableRow = (item: TenantRequest) => {
    if (isMobile) {
      return (
        <View key={item.id} style={[styles.tableRow, { backgroundColor: colorScheme.colors.card }]}>
          <View style={styles.tableRowContent}>
            <View style={styles.tableCell}>
              <Text style={[styles.tableCellLabel, { color: colorScheme.colors.text }]}>Username</Text>
              <Text style={[styles.tableCellValue, { color: colorScheme.colors.text }]}>{item.username}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.tableCellLabel, { color: colorScheme.colors.text }]}>Type</Text>
              <Text style={[styles.tableCellValue, { color: colorScheme.colors.text }]}>{item.type}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.tableCellLabel, { color: colorScheme.colors.text }]}>Status</Text>
              {renderStatusBadge(item.status)}
            </View>
            <View style={styles.tableCell}>
              <Text style={[styles.tableCellLabel, { color: colorScheme.colors.text }]}>Date</Text>
              <Text style={[styles.tableCellValue, { color: colorScheme.colors.text }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[styles.actionButtons]}>
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
      );
    }

    return (
      <View key={item.id} style={[styles.desktopTableRow, { backgroundColor: colorScheme.colors.card }]}>
        <Text style={[styles.desktopTableCell, { color: colorScheme.colors.text }]}>{item.username}</Text>
        <Text style={[styles.desktopTableCell, { color: colorScheme.colors.text }]}>{item.type}</Text>
        <View style={styles.desktopTableCell}>
          {renderStatusBadge(item.status)}
        </View>
        <Text style={[styles.desktopTableCell, { color: colorScheme.colors.text }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View style={[styles.desktopTableCell, styles.desktopActionButtons]}>
          <Button
            onPress={() => handleStatusChange(item.id, 'approve')}
            style={[styles.desktopActionButton, { backgroundColor: colorScheme.colors.primary }]}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Approve</Text>
          </Button>
          
          <Button
            onPress={() => handleStatusChange(item.id, 'reject')}
            style={[styles.desktopActionButton, { backgroundColor: colorScheme.colors.notification }]}
          >
            <XCircle size={16} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Reject</Text>
          </Button>

          <Button
            onPress={() => handleStatusChange(item.id, 'reset')}
            style={[styles.desktopActionButton, { backgroundColor: colorScheme.colors.border }]}
          >
            <RotateCcw size={16} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Reset</Text>
          </Button>
        </View>
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

      {/* Table Body */}
      <ScrollView style={styles.tableBody}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(renderTableRow)
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subHeaderText: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    height: 40,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableRowContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tableCell: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  tableCellLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCellValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  errorText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  desktopTableRow: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  desktopTableCell: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  desktopActionButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  desktopActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
}); 