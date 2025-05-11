"use client"

import { useState } from "react"
import { useAuth } from "~/lib/core/contexts/AuthContext"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import LoginCommon from "~/components/common/LoginCommon"
import { View, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ isOpen, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const { signIn, signInAnonymously, signInAsGuest } = useAuth()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async () => {
    console.log('[LoginDialog] Starting email sign in with:', { email });
    setIsLoading(true)
    setError("")
    try {
      await signIn(email, password)
      console.log('[LoginDialog] Email sign in successful');
      onOpenChange(false)
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 100)
      }
      router.replace('/(tabs)')
    } catch (err) {
      console.error('[LoginDialog] Email sign in error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnonymousSignIn = async () => {
    console.log('[LoginDialog] Starting anonymous sign in');
    setIsLoading(true)
    setError("")
    try {
      await signInAnonymously()
      console.log('[LoginDialog] Anonymous sign in successful');
      onOpenChange(false)
      router.replace('/(tabs)')
    } catch (err) {
      console.error('[LoginDialog] Anonymous sign in error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during anonymous login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    console.log('[LoginDialog] Starting guest sign in');
    setIsLoading(true)
    setError("")
    try {
      await signInAsGuest()
      console.log('[LoginDialog] Guest sign in successful');
      onOpenChange(false)
      router.replace('/(tabs)')
    } catch (err) {
      console.error('[LoginDialog] Guest sign in error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during guest login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[400px] p-0 m-0 bg-white dark:bg-gray-800 rounded-2xl">
        <View className="flex-1">
          <View className="p-6">
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                SIGN IN
              </Text>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full justify-center items-center mr-3 bg-blue-100 dark:bg-blue-900/20">
                <MaterialIcons name="login" size={24} className="text-blue-500 dark:text-blue-400" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  Sign in to access your account and continue where you left off
                </Text>
              </View>
            </View>
          </View>

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
            onCancel={handleCancel}
          />
        </View>
      </DialogContent>
    </Dialog>
  )
}

