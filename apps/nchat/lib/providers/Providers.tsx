import React from 'react';
import { AuthProvider } from '~/lib/providers/auth/AuthProvider';
import { ColorSchemeProvider } from '~/lib/providers/theme/ColorSchemeProvider';
import { DesignProvider } from '~/lib/providers/theme/DesignSystemProvider';
import { ThemeProvider } from '~/lib/providers/theme/ThemeProvider';
import { StorageProvider } from '~/lib/providers/storage/StorageProvider';
import { FeedInteractionProvider } from '~/lib/providers/feed/FeedInteractionProvider';
import { APIProvider } from '~/lib/providers/api/APIProvider';
import { RealtimeProvider } from '~/lib/providers/RealtimeProvider';
import { NotificationProvider } from './NotificationProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StorageProvider>
      <AuthProvider>
        <APIProvider>
          <ColorSchemeProvider>
            <DesignProvider>
              <ThemeProvider>
                <RealtimeProvider>
                  <NotificationProvider>
                    <FeedInteractionProvider>
                      {children}
                    </FeedInteractionProvider>
                  </NotificationProvider>
                </RealtimeProvider>
              </ThemeProvider>
            </DesignProvider>
          </ColorSchemeProvider>
        </APIProvider>
      </AuthProvider>
    </StorageProvider>
  );
} 