import React, { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { AuthProvider } from '../core/contexts/AuthContext';
import { NotificationProvider } from '../core/contexts/NotificationContext';
import { FeedInteractionProvider } from '../enhanced-chat/providers/feed/FeedInteractionProvider';
import { APIProvider } from '../core/providers/api/APIProvider';
import { RealtimeProvider } from '../core/providers/RealtimeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {

  return (
    <AuthProvider>
      <APIProvider>
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
      </APIProvider>
    </AuthProvider>
  );
}
