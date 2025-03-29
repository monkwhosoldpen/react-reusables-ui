'use client';

import { useAuth } from "@/lib/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Users, Compass, Settings, Search, User, LogOut, LogIn, Home } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { memo } from 'react'

// Navigation items shared across desktop and mobile
export const navigationItems = [
  { name: 'Channels', href: '/', icon: Users },
  { name: 'Supermenu', href: '/supermenu', icon: Compass },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile Header */}
      <header className="flex h-16 border-b border-border bg-background/95 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 transition-colors">
        <div className="container mx-auto flex items-center justify-between w-full px-5">
          <Link href="/" className="md:hidden text-xl font-bold text-primary transition-colors">
            nchat
          </Link>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="relative text-foreground hover:bg-muted transition-colors"
              onClick={() => router.push('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="container mx-auto flex items-center justify-around py-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2.5 rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1.5 font-medium">{item.name}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center p-2.5 rounded-md transition-colors",
              pathname === '/settings'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1.5 font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

const UserButton = memo(({ user }: { user: any }) => {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative text-foreground hover:bg-muted/80 rounded-full h-10 w-10 transition-colors"
        >
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3 rounded-lg shadow-lg" align="end">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Signed in</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/login')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

UserButton.displayName = 'UserButton';

export default memo(Navigation); 