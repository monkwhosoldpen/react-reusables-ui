import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export function useLogin() {
  const router = useRouter();

  const showLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  return { showLogin };
} 