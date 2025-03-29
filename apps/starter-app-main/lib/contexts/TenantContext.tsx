import { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the tenant data
interface Tenant {
  tenant_supabase_url: string;
  tenant_supabase_anon_key: string;
  openai_api_key?: string;
  onesignal_app_id?: string;
  onesignal_api_key?: string;
  donation_enabled?: boolean;
  donors_config?: {
    name: string;
    logo: string;
    description: string;
    upi: string;
    email: string;
  };
  super_admins?: string[];
  is_update_only: boolean;
  is_premium: boolean;
  admin_dashboard?: {
    chats_groups_config: any;
    messages_config: any;
    features: any;
  };
  related_channels?: any[];
  store_products?: any[];
  store_services?: any[];
  custom_properties?: any;
}

const TenantContext = createContext<Tenant | null>(null);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTenantSelected, setIsTenantSelected] = useState<boolean>(false);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tenant data for 'janedoe' from the channels API
        const response = await fetch('/api/channels/janedoe');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tenant: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform the API response into our Tenant interface
        const tenantData: Tenant = {
          tenant_supabase_url: data.tenant_supabase_url,
          tenant_supabase_anon_key: data.tenant_supabase_anon_key,
          is_update_only: data.is_update_only,
          is_premium: data.is_premium,
          related_channels: data.related_channels,
          ...data.custom_properties, // This includes admin_dashboard and other custom fields
        };

        setTenant(tenantData);
        setIsTenantSelected(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tenant data');
        setTenant(null);
        setIsTenantSelected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading tenant data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!isTenantSelected) {
    return (
      <div className="no-tenant-container">
        <div>No tenant selected or found.</div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
