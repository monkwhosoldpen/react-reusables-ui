"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginCommon from "@/components/common/LoginCommon"

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ isOpen, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const { signIn, signInAnonymously } = useAuth()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnonymousSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      await signInAnonymously()

      // Close dialog first, then call success callback with a slight delay
      onOpenChange(false)
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 100)
      }
    } catch (err) {
      setError("Failed to sign in anonymously")
    } finally {
      setIsLoading(false)
    }
  }

  const { signInAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInAsGuest();
      onOpenChange(false)
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 100)
      }
    } catch (err) {
      setError('Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      onOpenChange(false)
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 100)
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Sign in to follow channels
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            You need to be signed in to follow channels and receive updates.
          </DialogDescription>
        </DialogHeader>

        {/* Right column with login form */}
        <LoginCommon
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleAnonymousSignIn={handleAnonymousSignIn}
          handleGuestSignIn={handleGuestSignIn}
        />
      </DialogContent>
    </Dialog>
  )
}

