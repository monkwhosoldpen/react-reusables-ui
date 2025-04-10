'use client';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
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
import {
  fetchTenantRequests,
  approveTenantRequest,
  rejectTenantRequest,
  resetTenantRequest,
  updateTenantRequestStatus,
  TenantRequestStatus,
  mapStatusToUI
} from '@/lib/api-client';

interface TenantRequest {
  id: string;
  requestInfo: any;
  type: string;
  uid: string;
  username: string;
  status: boolean | string;
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
        const requests = await fetchTenantRequests();
        setTenantRequests(requests);
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

  const renderStatusBadge = (status: boolean | string) => {
    const uiStatus = mapStatusToUI(status);
    
    if (uiStatus === 'approved') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colorScheme.colors.primary }]}>
          <CheckCircle size={16} color="#FFFFFF" />
          <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Approved</Text>
        </View>
      );
    } else if (uiStatus === 'rejected') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colorScheme.colors.notification }]}>
          <XCircle size={16} color="#FFFFFF" />
          <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Rejected</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colorScheme.colors.border }]}>
          <Clock size={16} color="#FFFFFF" />
          <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Pending</Text>
        </View>
      );
    }
  };

  const handleStatusChange = async (requestId: string, status: TenantRequestStatus) => {
    try {
      await updateTenantRequestStatus(requestId, status);
      const requests = await fetchTenantRequests();
      setTenantRequests(requests);
      setError(null);
    } catch (err) {
      console.error(`Error updating tenant request status to ${status}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
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

      {/* Requests List */}
      <ScrollView style={styles.scrollView}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} style={[styles.requestCard, { backgroundColor: colorScheme.colors.card }]}>
              <View style={styles.requestHeader}>
                <Text style={[styles.username, { color: colorScheme.colors.text }]}>
                  {request.username}
                </Text>
                {renderStatusBadge(request.status)}
              </View>
              
              <Text style={[styles.requestType, { color: colorScheme.colors.text }]}>
                Type: {request.type}
              </Text>
              
              <Text style={[styles.requestDate, { color: colorScheme.colors.text }]}>
                {new Date(request.created_at).toLocaleDateString()}
              </Text>

              <View style={styles.actionButtons}>
                <Button
                  onPress={() => handleStatusChange(request.id, 'approved')}
                  style={[styles.actionButton, { backgroundColor: colorScheme.colors.primary }]}
                >
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Approve</Text>
                </Button>
                
                <Button
                  onPress={() => handleStatusChange(request.id, 'rejected')}
                  style={[styles.actionButton, { backgroundColor: colorScheme.colors.notification }]}
                >
                  <XCircle size={16} color="#FFFFFF" />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Reject</Text>
                </Button>
              </View>
            </Card>
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
  scrollView: {
    flex: 1,
  },
  requestCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
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
  requestType: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
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
}); 