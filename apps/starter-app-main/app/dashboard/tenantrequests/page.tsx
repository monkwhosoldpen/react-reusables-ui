'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  RotateCcw,
  ChevronDown} from 'lucide-react';
import {
  fetchTenantRequests,
  approveTenantRequest,
  rejectTenantRequest,
  resetTenantRequest,
  updateTenantRequestStatus,
  TenantRequestStatus,
  mapStatusToUI} from '@/lib/api-client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, TenantRequestStatus>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState<TenantRequest[]>([]);

  // Load tenant requests
  useEffect(() => {
    const loadTenantRequests = async () => {
      setLoading(true);
      try {
        const requests = await fetchTenantRequests();
        console.log('Loaded requests with status values:', requests.map(r => ({ id: r.id, status: r.status, type: typeof r.status })));
        
        // Create a status map for the dropdown selections
        const newStatusMap: Record<string, TenantRequestStatus> = {};
        requests.forEach(request => {
          newStatusMap[request.id] = mapStatusToUI(request.status);
        });
        setStatusMap(newStatusMap);
        
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
      console.log('Tenant requests:', tenantRequests);
      const filtered = tenantRequests.filter(request => 
        JSON.stringify(request).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else if (!loading) {
      console.log('No tenant requests available');
      setFilteredRequests([]);
    }
  }, [searchTerm, tenantRequests, loading]);

  // Helper function to render status badge
  const renderStatusBadge = (status: boolean | string) => {
    const uiStatus = mapStatusToUI(status);
    console.log('Rendering badge for status:', status, 'type:', typeof status, 'UI status:', uiStatus);
    
    if (uiStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </span>
      );
    } else if (uiStatus === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const handleStatusChange = async (requestId: string, status: TenantRequestStatus) => {
    try {
      console.log('Updating status to:', status, 'for request ID:', requestId);
      
      // Update the local status map immediately for better UX
      setStatusMap(prev => ({
        ...prev,
        [requestId]: status
      }));
      
      await updateTenantRequestStatus(requestId, status);
      // Refresh the list after status update
      const requests = await fetchTenantRequests();
      console.log('After update, requests with status values:', requests.map(r => ({ id: r.id, status: r.status, type: typeof r.status })));
      
      // Update the status map with the refreshed data
      const newStatusMap: Record<string, TenantRequestStatus> = { ...statusMap };
      requests.forEach(request => {
        newStatusMap[request.id] = mapStatusToUI(request.status);
      });
      setStatusMap(newStatusMap);
      
      setTenantRequests(requests);
      setError(null);
    } catch (err) {
      console.error(`Error updating tenant request status to ${status}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading tenant requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading tenant requests</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Tenant Requests</h1>
        <p className="mt-2 text-muted-foreground">
          Manage tenant access requests
        </p>
      </div>

      {/* Requests List */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {request.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Select
                          onValueChange={(value) => handleStatusChange(request.id, value as TenantRequestStatus)}
                          value={statusMap[request.id] || mapStatusToUI(request.status)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No requests found</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm ? 'Try different search terms' : 'There are no tenant requests in the system'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
} 