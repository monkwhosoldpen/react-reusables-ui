import { useState, useEffect, useCallback } from 'react';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useApiData<T>(
  apiCall: () => Promise<{ data: T }>,
  refreshInterval?: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{ data: T } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiCall();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateData = useCallback((newData: { data: T }) => {
    setData(newData);
  }, []);

  return {
    isLoading,
    error,
    data,
    refreshData,
    updateData,
  };
} 