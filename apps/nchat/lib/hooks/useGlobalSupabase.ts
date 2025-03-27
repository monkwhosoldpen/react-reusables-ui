import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { GlobalSupabaseUrl } from '../supabase';
import { GlobalsupabaseAnonKey } from '../supabase';

interface TenantConnectionConfig {
  node_private_url: string;
  tenant_supabase_url: string;
  tenant_supabase_anon_key: string;
}

interface TenantConfig {
  username: string;
  owner_username: string;
  connection_config: TenantConnectionConfig;
  openai_api_key: string;
  onesignal_app_id: string;
  onesignal_api_key: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get environment variables
const GLOBAL_SUPABASE_URL = GlobalSupabaseUrl;
const GLOBAL_SUPABASE_ANON_KEY = GlobalsupabaseAnonKey;

if (!GLOBAL_SUPABASE_URL || !GLOBAL_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your environment.'
  );
}

// Create a singleton instance
let globalSupabaseInstance: SupabaseClient | null = null;

const getGlobalSupabase = () => {
  if (!globalSupabaseInstance) {
    globalSupabaseInstance = createClient(
      GLOBAL_SUPABASE_URL,
      GLOBAL_SUPABASE_ANON_KEY
    );
  }
  return globalSupabaseInstance;
};

export function useGlobalSupabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTenantConfig = async (username: string): Promise<{
    success: boolean;
    data?: TenantConfig;
    error?: string;
  }> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: configError } = await getGlobalSupabase()
        .from('tenant_config')
        .select('*')
        .eq('username', username)
        .single();

        console.log(data);

      if (configError) throw configError;

      return {
        success: true,
        data: data as TenantConfig
      };
    } catch (err: any) {
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    globalSupabase: getGlobalSupabase(),
    isLoading,
    error,
    getTenantConfig
  };
} 