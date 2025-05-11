import React from 'react';
import { AuthProvider } from '../core/contexts/AuthContext';
import { NotificationProvider } from '../core/contexts/NotificationContext';
import { APIProvider } from '../core/providers/api/APIProvider';
import { RealtimeProvider } from '../core/providers/RealtimeProvider';
import { ColorSchemeProvider } from '../core/providers/theme/ColorSchemeProvider';
import { DesignProvider } from '../core/providers/theme/DesignSystemProvider';
import { ThemeProvider } from '../core/providers/theme/ThemeProvider';
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
                    <>
                      <>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                      </>
                      <Toaster position="top-right" closeButton richColors />
                    </>
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