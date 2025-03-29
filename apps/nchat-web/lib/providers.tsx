'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';

import { Toaster } from 'sonner';
import { NotificationProvider } from './contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
      <Toaster position="top-right" closeButton richColors />
    </>
  );
} 