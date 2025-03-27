export interface TenantConfig {
  username: string;
  owner_username: string;
  connection_config: {
    tenant_supabase_url: string;
    tenant_supabase_anon_key: string;
  };
  openai_api_key: string;
  onesignal_app_id: string;
  onesignal_api_key: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 