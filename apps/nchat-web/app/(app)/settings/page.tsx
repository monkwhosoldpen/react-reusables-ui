'use client';

import { useTheme } from 'next-themes';
import { useAuth } from "@/lib/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { NotificationPreference } from "@/components/common/NotificationPreference";
import LanguageChanger from "@/components/common/LanguageChanger";
import { UserLocation } from "@/components/common/UserLocation";
import {
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  LogIn,
  Bell,
  Shield,
  HelpCircle,
  Info,
  Smartphone,
  Globe,
  MapPin,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  // Use useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const isDark = mounted && theme === 'dark';

  const SettingsGroup = ({ title, children }: { title?: string, children: React.ReactNode }) => (
    <div className="bg-card rounded-lg overflow-hidden mb-4">
      {title && (
        <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
          {title}
        </div>
      )}
      {children}
    </div>
  );

  const SettingsItem = ({
    icon: Icon,
    title,
    description,
    onClick,
    rightElement,
    destructive
  }: {
    icon: any,
    title: string,
    description?: string,
    onClick?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean
  }) => (
    <div
      className={cn(
        "w-full p-4 flex items-center justify-between hover:bg-muted/50 border-b last:border-b-0 border-border cursor-pointer",
        destructive && "text-destructive hover:text-destructive"
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Icon className={cn("h-5 w-5", destructive ? "text-destructive" : "text-foreground")} />
        <div className="text-left">
          <h3 className={cn("font-medium", destructive && "text-destructive")}>{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {rightElement || <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </div>
  );

  // Prevent hydration mismatch by not rendering theme-dependent elements until mounted
  if (!mounted) {
    return (
      <div className="h-full flex flex-col p-3 overflow-hidden">
        {/* Loading state or skeleton UI could be added here */}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
    
      {/* Profile Section */}
      <SettingsGroup>
        <div className="p-6">
          <div className="flex items-center space-x-5">
            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'guest'}`}
                alt="Profile picture"
              />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-medium">{user?.email || 'Guest User'}</h2>
              <p className="text-sm text-muted-foreground">
                {user ? 'Signed in' : 'Not signed in'}
              </p>
            </div>
          </div>
        </div>
      </SettingsGroup>

      {/* Preferences Section */}
      <SettingsGroup title="Preferences">
        <SettingsItem
          icon={isDark ? Moon : Sun}
          title="Dark Mode"
          description="Toggle dark/light theme"
          rightElement={
            <Switch
              checked={isDark}
              onCheckedChange={handleThemeToggle}
            />
          }
        />
        <SettingsItem
          icon={Globe}
          title="Language"
          description="Change display language"
          rightElement={
            <LanguageChanger variant="settings" />
          }
        />
      </SettingsGroup>

      {/* Location Section */}
      <SettingsGroup title="Location">
        <UserLocation />
      </SettingsGroup>

      <div className="p-4 border-t border-border bg-muted/30 mb-4">
        <NotificationPreference showDebug={true} />
      </div>

      {/* Account Section */}
      <SettingsGroup title="Account">
        {user ? (
          <SettingsItem
            icon={LogOut}
            title="Sign Out"
            description="Sign out of your account"
            onClick={() => signOut()}
            destructive
          />
        ) : (
          <SettingsItem
            icon={LogIn}
            title="Sign In"
            description="Sign in to your account"
            onClick={() => router.push('/login')}
          />
        )}
      </SettingsGroup>
    </div>
  );
} 