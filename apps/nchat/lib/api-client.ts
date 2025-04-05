// API client utility for dashboard operations

import { config } from './config';

interface TenantUser {
  username: string;
  userType: string;
  tier: string;
  status: string;
}

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

// Status options for tenant requests
export type TenantRequestStatus = 'pending' | 'approved' | 'rejected';

// Map API status values to UI status values
export function mapStatusToUI(status: boolean | string): TenantRequestStatus {
  if (status === true || status === 'APPROVED' || status === 'true') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

// Fetch tenant users from the API
export async function fetchTenantUsers(): Promise<TenantUser[]> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantUsers);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (err) {
    console.error('Error fetching tenant users:', err);
    throw err;
  }
}

// Fetch tenant requests from the API
export async function fetchTenantRequests(): Promise<TenantRequest[]> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantRequests);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API client received tenant requests:', data.requests);
    return data.requests || [];
  } catch (err) {
    console.error('Error fetching tenant requests:', err);
    throw err;
  }
}

// Update tenant request status
export async function updateTenantRequestStatus(requestId: string, status: TenantRequestStatus): Promise<void> {
  try {
    // Map status to action
    let action: string;
    switch (status) {
      case 'approved':
        action = 'approve';
        break;
      case 'rejected':
        action = 'reject';
        break;
      case 'pending':
      default:
        action = 'reset';
        break;
    }

    console.log(`API client: Updating request ${requestId} with action ${action} for status ${status}`);

    const response = await fetch(config.api.endpoints.dashboard.tenantRequests, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        action
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API client: Update result:', result);
  } catch (err) {
    console.error(`Error updating tenant request status to ${status}:`, err);
    throw err;
  }
}

// Approve a tenant request
export async function approveTenantRequest(requestId: string): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantRequests, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        action: 'approve'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error approving tenant request:', err);
    throw err;
  }
}

// Reject a tenant request
export async function rejectTenantRequest(requestId: string): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantRequests, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        action: 'reject'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error rejecting tenant request:', err);
    throw err;
  }
}

// Reset a tenant request status to pending
export async function resetTenantRequest(requestId: string): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantRequests, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        action: 'reset'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error resetting tenant request:', err);
    throw err;
  }
}

// Create a test tenant request
export async function createTestTenantRequest(username: string): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.tenantRequests, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error creating test tenant request:', err);
    throw err;
  }
}

// Test API connection
export async function testApiConnection(): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.test);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error testing API connection:', err);
    throw err;
  }
}

// Create tenant tables
export async function createTenantTables(): Promise<void> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.createTables, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error creating tenant tables:', err);
    throw err;
  }
}

// Get connection status
export async function getConnectionStatus(): Promise<{ connected: boolean, url: string | null }> {
  try {
    const response = await fetch(config.api.endpoints.dashboard.connectionStatus);
    if (!response.ok) {
      return { connected: false, url: null };
    }
    
    const data = await response.json();
    return { 
      connected: data.connected || false, 
      url: data.url || null 
    };
  } catch (err) {
    console.error('Error getting connection status:', err);
    return { connected: false, url: null };
  }
} 