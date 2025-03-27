import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Alert, TextInput } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useUserSettings } from '~/lib/providers/UserSettingsProvider';

interface AnonymousUpgradeProps {
  onClose?: () => void;
}

export default function AnonymousUpgrade({ onClose }: AnonymousUpgradeProps) {
  const { settings, linkEmailToAnonymousUser, linkPasswordToUser, linkOAuthToAnonymousUser } = useUserSettings();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!settings?.is_anonymous) {
    return null;
  }

  const handleEmailUpgrade = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
      }

      await linkEmailToAnonymousUser(email);
      setIsVerifying(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to link email');
    }
  };

  const handlePasswordSet = async () => {
    try {
      if (!password) {
        Alert.alert('Error', 'Please enter a password');
        return;
      }

      await linkPasswordToUser(password);
      Alert.alert('Success', 'Your account has been upgraded!');
      onClose?.();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to set password');
    }
  };

  const handleOAuthUpgrade = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      await linkOAuthToAnonymousUser(provider);
      Alert.alert('Success', 'Your account has been upgraded!');
      onClose?.();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to link account');
    }
  };

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <View style={styles.header as ViewStyle}>
          <Text style={styles.title}>Verify your email</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton as ViewStyle}>
              <Ionicons name="close" size={24} color="#111b21" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.content as ViewStyle}>
          <Text style={styles.message}>
            We've sent a verification link to {email}. Please check your email and click the link to verify your account.
          </Text>
          <View style={styles.inputContainer as ViewStyle}>
            <Text style={styles.label}>Set a password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={styles.button as ViewStyle}
            onPress={handlePasswordSet}
          >
            <Text style={styles.buttonText}>Set Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isEmailMode) {
    return (
      <View style={styles.container}>
        <View style={styles.header as ViewStyle}>
          <Text style={styles.title}>Upgrade your account</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton as ViewStyle}>
              <Ionicons name="close" size={24} color="#111b21" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.content as ViewStyle}>
          <View style={styles.inputContainer as ViewStyle}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.button as ViewStyle}
            onPress={handleEmailUpgrade}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton as ViewStyle}
            onPress={() => setIsEmailMode(false)}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.title}>Upgrade your account</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton as ViewStyle}>
            <Ionicons name="close" size={24} color="#111b21" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content as ViewStyle}>
        <Text style={styles.message}>
          Upgrade your account to save your settings and chat history across devices.
        </Text>
        <TouchableOpacity
          style={styles.button as ViewStyle}
          onPress={() => setIsEmailMode(true)}
        >
          <Ionicons name="mail" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button as ViewStyle, styles.googleButton]}
          onPress={() => handleOAuthUpgrade('google')}
        >
          <Ionicons name="logo-google" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button as ViewStyle, styles.appleButton]}
          onPress={() => handleOAuthUpgrade('apple')}
        >
          <Ionicons name="logo-apple" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111b21',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  message: {
    fontSize: 16,
    color: '#667781',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#111b21',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111b21',
  },
  button: {
    backgroundColor: '#00a884',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#00a884',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  appleButton: {
    backgroundColor: '#000',
  },
}); 