import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '~/lib/contexts/AuthContext';

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
  isLoading: boolean;
  error?: Error;
  isOnline: boolean;
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
  const { user } = useAuth();
  const [interactionStates, setInteractionStates] = useState<Record<string, InteractionState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Add network status tracking
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced load interaction states
  useEffect(() => {
    const loadInteractionStates = async () => {
      if (!user) {
        setInteractionStates({});
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const storedStates = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`);
        if (storedStates) {
          const parsedStates = JSON.parse(storedStates);
          // Validate and sanitize stored data
          const validatedStates = Object.entries(parsedStates).reduce((acc, [key, value]) => {
            if (isValidInteractionState(value)) {
              acc[key] = {
                ...value,
                lastInteractionTime: value.lastInteractionTime ? new Date(value.lastInteractionTime) : undefined
              };
            }
            return acc;
          }, {} as Record<string, InteractionState>);
          
          setInteractionStates(validatedStates);
        }
      } catch (error) {
        console.error('Error loading interaction states:', error);
        setError(error instanceof Error ? error : new Error('Failed to load interaction states'));
        // Clear potentially corrupted data
        setInteractionStates({});
      } finally {
        setIsLoading(false);
      }
    };

    loadInteractionStates();
  }, [user]);

  // Add data consistency check
  const validateInteractionState = (state: InteractionState): boolean => {
    if (!state) return false;
    if (typeof state.hasInteracted !== 'boolean') return false;
    if (typeof state.partialInteraction !== 'boolean') return false;
    if (state.lastInteractionTime && !(state.lastInteractionTime instanceof Date)) return false;
    if (typeof state.attempts !== 'number' || state.attempts < 0) return false;
    return true;
  };

  // Enhanced save interaction states
  const saveInteractionStates = useCallback(async (states: Record<string, InteractionState>) => {
    if (!user || !isOnline) return;
    
    try {
      // Validate all states before saving
      const validStates = Object.entries(states).reduce((acc, [key, state]) => {
        if (validateInteractionState(state)) {
          acc[key] = state;
        }
        return acc;
      }, {} as Record<string, InteractionState>);

      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(validStates));
    } catch (error) {
      console.error('Error saving interaction states:', error);
      setError(error instanceof Error ? error : new Error('Failed to save interaction states'));
    }
  }, [user, isOnline]);

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

  // Enhanced record interaction
  const recordInteraction = useCallback(async (
    feedId: string,
    isPartial = false,
    duration?: number
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to interact');
    }

    if (!isOnline) {
      // Queue interaction for when online
      const queuedInteraction = {
        feedId,
        isPartial,
        duration,
        timestamp: new Date()
      };
      await AsyncStorage.setItem('queued-interactions', JSON.stringify([queuedInteraction]));
      return;
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

    if (!validateInteractionState(newState)) {
      throw new Error('Invalid interaction state');
    }

    const newStates = {
      ...interactionStates,
      [feedId]: newState,
    };

    setInteractionStates(newStates);
    await saveInteractionStates(newStates);
  }, [user, isOnline, interactionStates, getInteractionState, saveInteractionStates]);

  // Add cleanup for queued interactions
  useEffect(() => {
    const processQueuedInteractions = async () => {
      if (!isOnline || !user) return;
      
      try {
        const queued = await AsyncStorage.getItem('queued-interactions');
        if (queued) {
          const interactions = JSON.parse(queued);
          for (const interaction of interactions) {
            await recordInteraction(
              interaction.feedId,
              interaction.isPartial,
              interaction.duration
            );
          }
          await AsyncStorage.removeItem('queued-interactions');
        }
      } catch (error) {
        console.error('Error processing queued interactions:', error);
      }
    };

    if (isOnline) {
      processQueuedInteractions();
    }
  }, [isOnline, user, recordInteraction]);

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
        isLoading,
        error,
        isOnline
      }}
    >
      {children}
    </FeedInteractionContext.Provider>
  );
}

// Helper function to validate interaction state
function isValidInteractionState(value: any): value is InteractionState {
  if (!value || typeof value !== 'object') return false;
  return (
    typeof value.hasInteracted === 'boolean' &&
    typeof value.partialInteraction === 'boolean' &&
    typeof value.attempts === 'number' &&
    value.attempts >= 0
  );
} 