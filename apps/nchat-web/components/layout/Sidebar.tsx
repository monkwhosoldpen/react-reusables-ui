'use client';

import { cn } from "@/lib/utils"
import { Home, Users, Compass, Settings, Bell, Globe, LogOut, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useNotification } from "@/lib/contexts/NotificationContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { navigationItems } from "./navigation";
import LanguageChanger from "@/components/common/LanguageChanger";

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotification();
  const { user, userInfo, signOut, isGuest } = useAuth();
  
  // Get the actual channel count from userInfo
  const channelCount = 0;

  // If isMobile is true, only render the mobile navigation
  if (isMobile) {
    return (
      <div className="flex items-center justify-around py-2 h-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isAlerts = item.href === '/alerts';
          const isChannels = item.href === '/' && item.name === 'Channels';
          const showAlertBadge = isAlerts && unreadCount > 0;
          const showChannelBadge = isChannels && channelCount > 0;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-1.5 rounded-md transition-colors relative",
                pathname === item.href
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
            >
              <div className="relative" style={{ width: '24px', height: '24px' }}>
                <Icon className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                {showAlertBadge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] rounded-full min-h-[16px] min-w-[16px] flex items-center justify-center px-[3px] shadow-sm border border-white dark:border-gray-950">
                    {unreadCount}
                  </span>
                )}
                {showChannelBadge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] rounded-full min-h-[16px] min-w-[16px] flex items-center justify-center px-[3px] shadow-sm border border-white dark:border-gray-950">
                    {channelCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-full h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
              nchat
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isAlerts = item.href === '/alerts';
            const isChannels = item.href === '/' && item.name === 'Channels';
            const showAlertBadge = isAlerts && unreadCount > 0;
            const showChannelBadge = isChannels && channelCount > 0;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors relative",
                  pathname === item.href
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/10"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
                {showAlertBadge && (
                  <span className="ml-auto bg-emerald-600 text-white text-xs rounded-full px-2 py-0.5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {showChannelBadge && (
                  <span className="ml-auto bg-emerald-600 text-white text-xs rounded-full px-2 py-0.5 flex items-center justify-center">
                    {channelCount}
                  </span>
                )}
              </Link>
            );
          })}
          
          {/* Language Changer */}
          <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors relative text-gray-600 dark:text-gray-400">
            <Globe className="h-5 w-5" />
            <div className="ml-auto">
              <LanguageChanger variant="settings" />
            </div>
          </div>
        </nav>

        {/* User Status and Sign In/Out */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          {/* User Status */}
          <div className="px-4 py-3 text-xs">
            {user ? (
              <>
                <p className="font-medium truncate">{user.email}</p>
                <p className="mt-0.5 text-gray-500 dark:text-gray-400">
                  {isGuest ? 'Guest User' : 'Signed In User'}
                </p>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Not Signed In</p>
            )}
          </div>

          {/* Sign In/Out Option */}
          <div 
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors relative cursor-pointer",
              user ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10" : "text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/10"
            )}
            onClick={() => user ? signOut() : router.push('/login')}
          >
            {user ? (
              <>
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Only shown when not explicitly rendered as mobile */}
      <nav className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isAlerts = item.href === '/alerts';
            const isChannels = item.href === '/' && item.name === 'Channels';
            const showAlertBadge = isAlerts && unreadCount > 0;
            const showChannelBadge = isChannels && channelCount > 0;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-1.5 rounded-md transition-colors relative",
                  pathname === item.href
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                )}
              >
                <div className="relative" style={{ width: '24px', height: '24px' }}>
                  <Icon className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  {showAlertBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] rounded-full min-h-[16px] min-w-[16px] flex items-center justify-center px-[3px] shadow-sm border border-white dark:border-gray-950">
                      {unreadCount}
                    </span>
                  )}
                  {showChannelBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] rounded-full min-h-[16px] min-w-[16px] flex items-center justify-center px-[3px] shadow-sm border border-white dark:border-gray-950">
                      {channelCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
} 