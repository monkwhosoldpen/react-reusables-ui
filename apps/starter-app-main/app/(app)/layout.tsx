'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "relative min-h-screen bg-background flex flex-col",
      !mounted && "invisible"
    )}>
      {/* Navbar - Match height with logged-out state */}
      <div className="sticky top-0 z-50 h-16">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-56 lg:w-64 flex-shrink-0 border-r border-border">
          <Sidebar />
        </div>

        {/* Main Content - Adjusts based on sidebar visibility */}
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Sticky at bottom */}
      <div className="md:hidden sticky bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-40">
        <Sidebar isMobile={true} />
      </div>
    </div>
  );
} 