'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import DefaultLayout from '@/components/layout/defaultlayout';

export default function LoginCommon({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  handleSubmit,
  handleAnonymousSignIn,
  handleGuestSignIn,
}: {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleAnonymousSignIn: () => void;
  handleGuestSignIn: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 text-center md:text-left">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary transition-colors">
          Welcome to nchat
        </h1>
      </div>

      <div className="w-full max-w-md mx-auto md:mx-0 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className={cn(
                "h-11",
                "bg-background dark:bg-card border-border/50",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className={cn(
                "h-11",
                "bg-background dark:bg-card border-border/50",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary"
              )}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 p-2 rounded-lg border border-destructive/20">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className={cn(
              "w-full h-11 text-base font-medium",
              "bg-primary hover:bg-primary/90",
              "shadow-sm hover:shadow-md transition-all"
            )}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        {/* Anonymous Sign In */}
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 text-base font-medium",
            "border-border/50 hover:bg-primary/10",
            "shadow-sm hover:shadow-md transition-all"
          )}
          onClick={handleAnonymousSignIn}
          disabled={isLoading}
        >
          Continue as Anonymous
        </Button>

        {/* Guest Mode Button */}
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 text-base font-medium",
            "border-border/50 hover:bg-primary/10",
            "shadow-sm hover:shadow-md transition-all"
          )}
          onClick={handleGuestSignIn}
          disabled={isLoading}
        >
          Continue as Guest
        </Button>

        {/* Back to Home */}
        <div className="text-center md:text-left">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground/70 hover:text-primary hover:bg-primary/10"
            onClick={() => window.history.back()} // This allows going back without routing issues
          >
            ← Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
