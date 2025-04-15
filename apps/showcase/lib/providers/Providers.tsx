import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { FeedInteractionProvider } from './feed/FeedInteractionProvider';
import { APIProvider } from './api/APIProvider';
import { RealtimeProvider } from './RealtimeProvider';
import { ColorSchemeProvider } from './theme/ColorSchemeProvider';
import { DesignProvider } from './theme/DesignSystemProvider';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <AuthProvider>
        <APIProvider>
          <ColorSchemeProvider>
            <DesignProvider>
              <ThemeProvider>
                <RealtimeProvider>
                  <>
                    <FeedInteractionProvider>
                      <>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                      </>
                      <Toaster position="top-right" closeButton richColors />
                    </FeedInteractionProvider>
                  </>
                </RealtimeProvider>
              </ThemeProvider>
            </DesignProvider>
          </ColorSchemeProvider>
        </APIProvider>
      </AuthProvider>
    </>
  );
} 