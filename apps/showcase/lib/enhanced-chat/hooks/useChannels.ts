import { useState, useEffect } from 'react';

interface Channel {
  username: string;
  stateName: string;
  is_premium: boolean;
  is_update_only: boolean;
  is_public: boolean;
  is_agent: boolean;
  is_owner_db: boolean;
  is_realtime: boolean;
  related_channels: Channel[];
  related_channels_count: number;
  products: any[];
  products_count: number;
  parliamentaryConstituency: string;
  tenant_supabase_url: string;
  tenant_supabase_anon_key: string;
  owner_username: string;
  isFollowing: boolean;
  last_updated_at: string;
  last_message: {
    id: string;
    message_text: string;
    text: string;
    created_at: string;
  };
  parent_channel: null;
  onboardingConfig?: {
    welcomescreen: {
      hero: string;
      ctaText: string;
      welcomeText: string;
      welcomeImage: string;
    };
    screens: Array<{
      name: string;
      slug: string;
      label: string;
      description: string;
      form: {
        fields: Array<{
          name: string;
          type: string;
          label: string;
          required: boolean;
          options?: string[];
        }>;
      };
    }>;
    finishscreen: {
      ctaUrl: string;
      finishText: string;
      finishImage: string;
    };
  };
}

interface ChannelResponse {
  mainChannel: Channel;
}

export const useChannels = (username: string) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/channels/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data: ChannelResponse = await response.json();
        // Set both the main channel and related channels
        setChannels([
          data.mainChannel,
          ...data.mainChannel.related_channels
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [username]);

  return { channels, isLoading, error };
}; 