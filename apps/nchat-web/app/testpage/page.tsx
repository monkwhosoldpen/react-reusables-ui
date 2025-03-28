'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
// import AppLayout from './(app)/layout';
// import ChannelsPage from '../components/Channels';
// import DefaultLayout from '@/components/layout/defaultlayout';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // If still loading, show nothing to prevent flash
  if (loading) {
    return null; // or return a loading spinner if you prefer
  }

  return (
    <>
      {user ? (
        <>
          {/* <ChannelsPage /> */}
        </>
      ) : (
        <>
          {/* Main Content */}
          <main className="flex-1 w-full py-12 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto px-6">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl font-bold text-primary transition-colors">
                    nchat
                  </h1>
                  <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl transition-colors">
                    Your messaging app for everyday communication
                  </p>
                </div>

                <p className="text-muted-foreground max-w-2xl">
                  Connect with friends, family, and colleagues in a simple, secure environment.
                  Share messages, media, and more with our intuitive platform.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="mt-6 px-8 text-lg h-12 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
}

