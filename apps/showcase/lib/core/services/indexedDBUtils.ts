import { 
  LastMessage, 
  UserLocation,
  TenantRequest 
} from './indexedDBSchema';

// Pure utility functions
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const createChannelActivityFromMessage = (message: any) => {
  return {
    username: message.username,
    last_updated_at: getCurrentTimestamp(),
    message_count: message.message_count,
    last_message: {
      id: message.id,
      message_text: message.message_text,
      created_at: message.created_at
    }
  };
};

export const createTimestampedRecord = (userId: string, records: any[]) => {
  return {
    user_id: userId,
    records: records,
    timestamp: getCurrentTimestamp()
  };
};

export const createChannelViewedRecord = (record: any) => {
  return {
    user_id: record.user_id,
    username: record.channel_id,
    last_viewed: record.viewed_at,
    message_count: 0
  };
};

export const createUserLocationRecord = (userId: string, location: any): UserLocation => {
  return {
    user_id: userId,
    ...location,
    last_updated: getCurrentTimestamp()
  };
};

/**
 * Filter out undefined records from an array
 */
export function filterUndefinedRecords<T>(records: (T | undefined)[]): T[] {
  return records.filter((record): record is T => record !== undefined);
}

/**
 * Type-safe filter for maps to avoid implicit any errors
 */
export function typedFilter<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  return array.filter(predicate);
}

/**
 * Typed map function for arrays to avoid implicit any errors 
 */
export function typedMap<T, R>(array: T[], mapper: (value: T, index: number, array: T[]) => R): R[] {
  return array.map(mapper);
} 