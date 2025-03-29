'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Home, Star, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';
import { FollowButton } from '@/components/common/FollowButton';
import { Loading } from '@/components/ui/loading';

// Define the Channel type
interface Channel {
  username: string;
  is_premium?: boolean;
  role?: string;
  type?: string;
  stateName?: string;
  assemblyName?: string;
  isFollowing?: boolean;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load channels data when the component mounts
  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/channels');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setChannels(data);
        } else if (data.success) {
          setChannels(data.channels);
        } else {
          throw new Error(data.error || 'Failed to fetch channels');
        }
      } catch (error) {
        setError('Failed to load channels. Please try again.');
        toast.error('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  // Define channel categories
  const channelCategories = [
    { id: 'all', label: 'all', icon: Home },
    { id: 'premium', label: 'premium', icon: Star },
  ];

  // Memoize the filtered channels to prevent recalculation on every render
  const filteredChannels = useMemo(() => {
    // Check if channels array is valid
    if (!channels || channels.length === 0) {
      return [];
    }
    
    // Ensure all channels have the is_premium property set
    const processedChannels = channels.map(channel => {
      // If is_premium is undefined, set it based on username
      if (channel.is_premium === undefined) {
        // These usernames are known to be premium
        const isPremium = channel.username === 'janedoe' || channel.username === 'elonmusk';
        return { ...channel, is_premium: isPremium };
      }
      return channel;
    });
    
    // Check for premium channels
    const premiumChannels = processedChannels.filter(channel => channel.is_premium);
    
    return processedChannels.filter(channel => {
      // Filter by category
      if (selectedCategory === 'all') {
        // Show all channels
      } else if (selectedCategory === 'premium') {
        if (!channel.is_premium) return false;
      } else if (channel.role !== selectedCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !channel.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [channels, selectedCategory, searchQuery]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Search and Categories */}
        <div className="sticky top-0 z-10">
          {/* WhatsApp-like header skeleton */}
          <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800">
            <div className="container py-4">
              <div className="relative w-full max-w-md mx-auto">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Skeleton className="w-full h-10 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
                </div>
              </div>
            </div>
          </div>
          
          {/* WhatsApp-like tabs skeleton */}
          <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800 py-2">
            <div className="container overflow-x-auto no-scrollbar">
              <div className="flex gap-2 min-w-full px-1">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-9 w-32 rounded-full bg-gray-200 dark:bg-gray-700/50" />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4 text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            There was a problem loading the channels. This could be due to a network issue or the server might be unavailable.
          </p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Categories */}
      <div className="sticky top-0 z-10">
        {/* WhatsApp-like header */}
        <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800">
          <div className="container py-4">
            <div className="relative w-full max-w-md mx-auto">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10 w-full rounded-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="Search channels"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* WhatsApp-like tabs */}
        <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800 py-2">
          <div className="container overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-full px-1">
              {channelCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "rounded-full px-4 py-2 h-auto text-sm font-medium",
                    selectedCategory === category.id
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-4 px-3 md:px-4">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No channels found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredChannels.map((channel, index) => {
                // Check if user is following this channel
                const isFollowing = [].some(
                  (followedChannel: any) => 
                    (typeof followedChannel === 'string' && followedChannel === channel.username) || 
                    (typeof followedChannel === 'object' && followedChannel.username === channel.username)
                ) || false;
                
                return (
                  <div 
                    key={`${channel.username}-${index}`}
                    className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3">
                      <div className="flex flex-col space-y-3">
                        {/* Avatar and Premium Badge */}
                        <div className="flex justify-center mb-1">
                          <div className="relative">
                            <img
                              src={`https://placehold.co/100x100/emerald/white?text=${channel.username.substring(0, 2).toUpperCase()}`}
                              alt={channel.username}
                              className="w-16 h-16 rounded-full bg-emerald-100 object-cover"
                            />
                            {channel.is_premium && (
                              <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900" />
                            )}
                          </div>
                        </div>
                        
                        {/* Username and Location */}
                        <div className="text-center">
                          <Link href={`/${channel.username}`}>
                            <h3 className={cn(
                              "font-medium truncate text-sm",
                              channel.is_premium ? "text-yellow-500 dark:text-yellow-400" : ""
                            )}>@{channel.username}</h3>
                          </Link>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {channel.stateName} {channel.assemblyName ? `• ${channel.assemblyName}` : ''}
                          </p>
                        </div>
                        
                        {/* Follow Button */}
                        <div className="flex justify-center pt-1">
                          <FollowButton 
                            username={channel.username} 
                            size="sm" 
                            className="text-xs h-8 min-w-[80px]"
                            initialFollowing={isFollowing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 