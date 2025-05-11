'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { ChannelActivity } from '../types/notifications';
import {
  AuthHelper,
  AuthHelperReturn
} from '~/lib/core/helpers/AuthHelpers';
import {
  SampleHelper,
  SampleHelperReturn
} from '~/lib/core/helpers/SampleHelper';
import { Channel, ChannelMessage, TenantRequest, UserInfo } from '~/lib/core/types/channel.types';

// Define a simplified context type without the raw DB records functions
interface SimplifiedAuthContextType {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateNotificationPreference: (enabled: boolean) => Promise<void>;
  updatePushSubscription: (subscription: PushSubscription, enabled: boolean) => Promise<void>;
  getChannelActivity: () => Promise<{
    channelActivityRecords: ChannelActivity[];
    userLanguage: string;
    tenantRequests: TenantRequest[];
  }>;
  updateLanguagePreference: (language: string) => Promise<void>;
  isFollowingChannel: (username: string) => Promise<boolean>;
  followChannel: (username: string) => Promise<void>;
  unfollowChannel: (username: string) => Promise<void>;
  testFn: (username: string) => Promise<void>;
  fetchChannelDetails: (username: string) => Promise<{
    channelData: Channel | null;
    error: string | null;
  }>;
  completeChannelOnboarding: (channelUsername: string, channelDetails: Channel) => Promise<boolean>;
  fetchChannelMessages: (
    username: string, 
    pageSize: number, 
    lastTimestamp?: string | null
  ) => Promise<{
    messages: ChannelMessage[];
    accessStatus: any;
    hasMore: boolean;
    error: string | null;
  }>;
  updateChannelLastViewed: (username: string) => Promise<boolean>;
}

// Create the context with our defined type
const AuthContext = createContext<SimplifiedAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the AuthHelper to get all the functionality
  const auth = AuthHelper();

  // Destructure only the properties we want to use
  const {
    user,
    userInfo,
    loading,
    isGuest,
    signIn,
    signInAnonymously,
    signInAsGuest,
    signOut,
    refreshUserInfo,
  } = auth;

  // Use SampleHelper and get functions from it
  const { 
    testFn, 
    updateLanguagePreference,
    updateNotificationPreference,
    updatePushSubscription,
    isFollowingChannel,
    followChannel,
    unfollowChannel,
    getChannelActivity,
    fetchChannelDetails,
    completeChannelOnboarding,
    fetchChannelMessages,
    updateChannelLastViewed
  } = SampleHelper(user, isGuest);

  // Memoize auth context value to prevent unnecessary re-renders
  const contextValue = useMemo<SimplifiedAuthContextType>(() => ({
    user,
    userInfo,
    loading,
    isGuest,
    signIn,
    signInAnonymously,
    signInAsGuest,
    signOut,
    refreshUserInfo,
    updateNotificationPreference,
    updatePushSubscription,
    getChannelActivity,
    updateLanguagePreference,
    isFollowingChannel,
    followChannel,
    unfollowChannel,
    testFn,
    fetchChannelDetails,
    completeChannelOnboarding,
    fetchChannelMessages,
    updateChannelLastViewed
  }), [
    user, 
    userInfo, 
    loading, 
    isGuest, 
    signIn, 
    signInAnonymously, 
    signInAsGuest, 
    signOut, 
    refreshUserInfo, 
    updateNotificationPreference, 
    updatePushSubscription, 
    getChannelActivity, 
    updateLanguagePreference,
    isFollowingChannel,
    followChannel,
    unfollowChannel,
    testFn,
    fetchChannelDetails,
    completeChannelOnboarding,
    fetchChannelMessages,
    updateChannelLastViewed,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types that apps might need to use
export type { SimplifiedAuthContextType as AuthContextType, TenantRequest };