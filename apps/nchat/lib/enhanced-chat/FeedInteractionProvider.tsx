import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useUser } from '../providers/auth/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InteractionConfig {
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  requiredInteractionTime?: number; // in seconds
  maxAttempts?: number;
}

interface InteractionState {
  hasInteracted: boolean;
  partialInteraction: boolean;
  lastInteractionTime?: Date;
  interactionDuration?: number; // in seconds
  attempts: number;
}

interface FeedInteractionContextType {
  canInteract: (feedId: string, config?: InteractionConfig) => boolean;
  getInteractionState: (feedId: string) => InteractionState;
  recordInteraction: (feedId: string, isPartial?: boolean, duration?: number) => Promise<void>;
  clearInteraction: (feedId: string) => Promise<void>;
  clearAllInteractions: () => Promise<void>;
  hasReachedMaxAttempts: (feedId: string, maxAttempts: number) => boolean;
}

const FeedInteractionContext = createContext<FeedInteractionContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'feed-interactions-';
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_REQUIRED_INTERACTION_TIME = 30; // 30 seconds

export function useFeedInteraction() {
  const context = useContext(FeedInteractionContext);
  if (!context) {
    throw new Error('useFeedInteraction must be used within a FeedInteractionProvider');
  }
  return context;
}

interface FeedInteractionProviderProps {
  children: React.ReactNode;
}

export function FeedInteractionProvider({ children }: FeedInteractionProviderProps) {
  const { user } = useUser();
  const [interactionStates, setInteractionStates] = useState<Record<string, InteractionState>>({});

  // Load interaction states from storage on mount or user change
  useEffect(() => {
    const loadInteractionStates = async () => {
      if (!user) return;
      
      try {
        const storedStates = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`);
        if (storedStates) {
          const parsedStates = JSON.parse(storedStates);
          // Convert date strings back to Date objects
          Object.keys(parsedStates).forEach(key => {
            if (parsedStates[key].lastInteractionTime) {
              parsedStates[key].lastInteractionTime = new Date(parsedStates[key].lastInteractionTime);
            }
          });
          setInteractionStates(parsedStates);
        }
      } catch (error) {
        console.error('Error loading interaction states:', error);
      }
    };

    loadInteractionStates();
  }, [user]);

  const saveInteractionStates = useCallback(async (states: Record<string, InteractionState>) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(states));
    } catch (error) {
      console.error('Error saving interaction states:', error);
      throw error;
    }
  }, [user]);

  const canInteract = useCallback((feedId: string, config?: InteractionConfig): boolean => {
    if (!user) {
      return false;
    }

    const state = interactionStates[feedId];
    const now = new Date();

    // Check if interaction is allowed based on time constraints
    if (config) {
      if (config.startTime && now < config.startTime) {
        return false;
      }
      if (config.endTime && now > config.endTime) {
        return false;
      }
      if (config.maxAttempts && state?.attempts >= config.maxAttempts) {
        return false;
      }
      if (config.duration && state?.lastInteractionTime) {
        const timeSinceLastInteraction = (now.getTime() - state.lastInteractionTime.getTime()) / 1000 / 60;
        if (timeSinceLastInteraction < config.duration) {
          return false;
        }
      }
    }

    return true;
  }, [user, interactionStates]);

  const getInteractionState = useCallback((feedId: string): InteractionState => {
    return interactionStates[feedId] || {
      hasInteracted: false,
      partialInteraction: false,
      attempts: 0,
    };
  }, [interactionStates]);

  const recordInteraction = useCallback(async (
    feedId: string,
    isPartial = false,
    duration?: number
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to interact');
    }

    const now = new Date();
    const currentState = getInteractionState(feedId);

    const newState: InteractionState = {
      hasInteracted: !isPartial,
      partialInteraction: isPartial,
      lastInteractionTime: now,
      interactionDuration: duration,
      attempts: currentState.attempts + 1,
    };

    const newStates = {
      ...interactionStates,
      [feedId]: newState,
    };

    setInteractionStates(newStates);
    await saveInteractionStates(newStates);
  }, [user, interactionStates, getInteractionState, saveInteractionStates]);

  const clearInteraction = useCallback(async (feedId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to clear interaction');
    }

    const newStates = { ...interactionStates };
    delete newStates[feedId];

    setInteractionStates(newStates);
    await saveInteractionStates(newStates);
  }, [user, interactionStates, saveInteractionStates]);

  const clearAllInteractions = useCallback(async () => {
    if (!user) {
      throw new Error('User must be authenticated to clear interactions');
    }

    setInteractionStates({});
    await saveInteractionStates({});
  }, [user, saveInteractionStates]);

  const hasReachedMaxAttempts = useCallback((feedId: string, maxAttempts = DEFAULT_MAX_ATTEMPTS): boolean => {
    const state = getInteractionState(feedId);
    return state.attempts >= maxAttempts;
  }, [getInteractionState]);

  return (
    <FeedInteractionContext.Provider 
      value={{ 
        canInteract, 
        getInteractionState, 
        recordInteraction, 
        clearInteraction,
        clearAllInteractions,
        hasReachedMaxAttempts,
      }}
    >
      {children}
    </FeedInteractionContext.Provider>
  );
} 