/**
 * Channel-related type definitions
 */

// Main channel type definition
export type Channel = {
  username: string;
  stateName: string;
  is_premium: boolean;
  is_update_only: boolean;
  is_public: boolean;
  is_agent: boolean;
  is_enhanced_chat: boolean;
  is_owner_db: boolean;
  is_realtime: boolean;
  related_channels: Channel[];
  related_channels_count: number;
  products: any[];
  products_count: number;
  parliamentaryConstituency: string;
  tenant_supabase_url: string;
  tenant_supabase_anon_key: string;
  custom_properties: any;
  owner_username: string;
  isFollowing: boolean;
  last_updated_at: string;
  last_message: {
    id: string;
    message_text: string;
    text: string;
    created_at: string;
  };
  onboardingConfig: any;
  parent_channel: Channel | null;
}

// Main channel type definition
export type ChannelResponse = {
  mainChannel: Channel | null;
  parent_channel: Channel | null;
}

// Channel message type 
export interface ChannelMessage {
  id: string;
  channel_id: string;
  username: string;
  message_text: string;
  created_at: string;
  updated_at: string;
  is_translated: boolean;
  translations?: any;
}

// Extended channel interface for list views
export interface ExtendedChannel extends Channel {
  lastMessage?: {
    message_text: string;
    created_at: string;
  };
  unreadCount?: number;
  isFollowing: boolean;
  isApproved?: boolean;
}

// Channel view record for tracking read status
export interface ChannelViewRecord {
  username: string;
  message_count: number;
  last_viewed: string;
}

// Message group type for UI organization
export interface MessageGroup {
  date: string;
  messages: ChannelMessage[];
}

// Type for channel activity notifications
export interface ChannelActivity {
  username: string;
  last_updated_at: string;
  last_message: {
    id: string;
    message_text?: string;
    created_at: string;
  };
  message_count: number;
  read?: boolean;
}

// Tenant request type from AuthHelpers.ts
export interface TenantRequest {
  id: string;
  uid: string;
  status: string;
  requestInfo?: any;
  type?: string; 
  username?: string;
  created_at?: string;
  updated_at?: string;
}

// User location type for user preference data
export interface UserLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  locality?: string;
  city?: string;
  region?: string;
  state: string;
  district: string;
  mp_constituency: string;
  assembly_constituency: string;
  mandal: string;
  village: string;
  ward: string;
  pincode: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

// User info type containing basic user data
export interface UserInfo {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  app_metadata: any;

  user_metadata: any;
  language: string;
  notifications?: any;
  notifications_enabled?: boolean;
  tenantRequests?: TenantRequest[];
  userLocation?: UserLocation | null;
}