import React, { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { FeedInteractionProvider } from '../../enhanced-chat/providers/feed/FeedInteractionProvider';
import { RealtimeProvider } from './RealtimeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {

  return (
    <AuthProvider>
      <>
        <>
          <>
            <FeedInteractionProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
              {/* Global toast notifications */}
              <Toaster position="top-right" closeButton richColors />
            </FeedInteractionProvider>
          </>
        </>
      </>
    </AuthProvider>
  );
}
