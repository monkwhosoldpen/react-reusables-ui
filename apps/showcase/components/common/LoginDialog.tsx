"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginCommon from "@/components/common/LoginCommon"
import { useColorScheme } from "@/lib/providers/theme/ColorSchemeProvider"
import { useDesign } from "@/lib/providers/theme/DesignSystemProvider"
import { StyleSheet, View, Text } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ isOpen, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const { signIn, signInAnonymously, signInAsGuest } = useAuth()
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const styles = StyleSheet.create({
    dialogContent: {
      backgroundColor: colorScheme.colors.background,
      borderRadius: Number(design.radius.lg),
      width: '100%',
      maxWidth: 400,
      margin: 0,
      padding: 0,
    },
    content: {
      flex: 1,
    },
    header: {
      marginBottom: Number(design.spacing.padding.card),
    },
    sectionHeader: {
      backgroundColor: 'transparent',
    },
    sectionHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colorScheme.colors.text,
      opacity: 0.7,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: `${colorScheme.colors.primary}1A`,
    },
    title: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '700',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item),
    },
    description: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: 0.7,
      lineHeight: 24,
    },
  })

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
      <DialogContent style={styles.dialogContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>SIGN IN</Text>
            </View>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="login" size={24} color={colorScheme.colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.description}>
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

