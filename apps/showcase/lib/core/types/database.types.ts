export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      channels: {
        Row: {
          username: string;
          name: string;
          description?: string;
          avatar_url?: string;
          category?: string;
          premium: boolean;
          owner_username?: string;
          is_realtime: boolean;
          is_related_channel: boolean;
          last_message?: string;
          related_channels: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['channels']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['channels']['Insert']>;
      };
      feed: {
        Row: {
          id: string;
          type: 'tweet' | 'instagram' | 'linkedin' | 'whatsapp' | 'poll' | 'survey' | 'quiz';
          channel_username: string;
          content: string | null;
          caption: string | null;
          message: string | null;
          media: { type: string; url: string }[] | null;
          stats: Record<string, any> | null;
          metadata: Record<string, any> | null;
          interactive_content?: {
            poll?: {
              question: string;
              options: string[];
              votes: number[];
              expires_at: string;
            };
            survey?: {
              questions: {
                text: string;
                type: 'single' | 'multiple' | 'text';
                options?: string[];
              }[];
              responses: number;
            };
            quiz?: {
              questions: {
                text: string;
                options: string[];
                correct_option: number;
              }[];
              participants: number;
            };
          } | null;
          created_at: string;
          updated_at: string;
          expires_at: string | null;
          fill_requirement: 'partial' | 'strict' | null;
        };
        Insert: Omit<Database['public']['Tables']['feed']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['feed']['Insert']>;
      };
      stories: {
        Row: {
          id: string;
          channel_username: string;
          media_url: string;
          media_type: 'image' | 'video';
          caption: string | null;
          created_at: string;
          expires_at: string;
          stats: Json;
        };
        Insert: {
          id?: string;
          channel_username: string;
          media_url: string;
          media_type: 'image' | 'video';
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
          stats?: Json;
        };
        Update: {
          id?: string;
          channel_username?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
          stats?: Json;
        };
      };
      interactive_responses: {
        Row: {
          id: string;
          user_id: string;
          feed_item_id: string;
          response: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feed_item_id: string;
          response: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          feed_item_id?: string;
          response?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      get_channel_data: {
        Args: {
          p_username: string;
        };
        Returns: Database['public']['Tables']['channels']['Row'];
      };
      request_access_to_channel: {
        Args: {
          p_channel_username: string;
          p_user_id: string;
          p_user_details: Json;
        };
        Returns: {
          success: boolean;
          message: string;
          data?: {
            request_id: string;
            channel: Database['public']['Tables']['channels']['Row'];
            status: 'pending';
            requested_at: string;
          };
        };
      };
      get_request_access_info_all_channels: {
        Args: {
          p_channel_username: string;
          p_user_id: string;
        };
        Returns: {
          success: boolean;
          username?: string;
          channel?: Database['public']['Tables']['channels']['Row'];
          data: Record<string, boolean>;
          owner_channels?: Database['public']['Tables']['channels']['Row'][];
          message?: string;
        };
      };
    };
    Enums: {
      [key: string]: unknown;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Convenience types
export type Channel = Tables<'channels'>;
export type ChannelInsert = Inserts<'channels'>;
export type ChannelUpdate = Updates<'channels'>;

export type FeedItem = Tables<'feed'>;
export type FeedItemInsert = Inserts<'feed'>;
export type FeedItemUpdate = Updates<'feed'>;

// Enhanced Channel types
export interface ChannelData extends Channel {
  related_channels_data?: Channel[];
}

export interface ChannelResponse {
  data: ChannelData | null;
  error: Error | null;
} 