"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoginCommon from "@/components/common/LoginCommon"
import { useColorScheme } from "@/lib/providers/theme/ColorSchemeProvider"
import { useDesign } from "@/lib/providers/theme/DesignSystemProvider"
import { StyleSheet } from "react-native"

interface LoginDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ isOpen, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const { signIn, signInAnonymously } = useAuth()
  const { colorScheme } = useColorScheme()
  const { design } = useDesign()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const styles = StyleSheet.create({
    dialogContent: {
      backgroundColor: colorScheme.colors.background,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card),
      width: '100%',
      maxWidth: 400,
    },
    dialogHeader: {
      marginBottom: Number(design.spacing.padding.card),
    },
    dialogTitle: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '600',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.padding.item),
    },
    dialogDescription: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: 0.7,
    },
  })

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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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

  const handleSubmit = async () => {
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

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent style={styles.dialogContent}>
        <DialogHeader style={styles.dialogHeader}>
          <DialogTitle style={styles.dialogTitle}>
            Sign in to follow channels
          </DialogTitle>
          <DialogDescription style={styles.dialogDescription}>
            You need to be signed in to follow channels and receive updates.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}

