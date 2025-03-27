import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { router } from 'expo-router';

export default function CompleteProfileModal() {
  const { user, updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.metadata?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.metadata?.full_name) {
      // If user already has a name, they shouldn't be here
      router.back();
    }
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      
      // Debug logs before update
      console.log('CompleteProfile - Before Update - User:', JSON.stringify(user, null, 2));
      
      const updates = {
        user_metadata: {
          ...user?.user_metadata,
          full_name: fullName.trim(),
          status: user?.user_metadata?.status || 'Available',
        },
      };
      
      // Debug log the updates
      console.log('CompleteProfile - Updates to be applied:', JSON.stringify(updates, null, 2));
      
      await updateUserProfile(updates);
      
      // Debug log after update
      console.log('CompleteProfile - Update completed successfully');

      // Small delay to ensure state is updated before navigating back
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#111b21" />
        </TouchableOpacity>
        <Text style={styles.title}>Complete Your Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.continueButton}
          disabled={isLoading || !fullName.trim()}
        >
          <Text style={[
            styles.continueText, 
            (isLoading || !fullName.trim()) && styles.continueTextDisabled
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to GoatsConnect!</Text>
          <Text style={styles.welcomeText}>
            Please enter your name to complete your profile. This will help your contacts recognize you.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your name"
            placeholderTextColor="#8696a0"
            editable={!isLoading}
            autoFocus
          />
          <Text style={styles.helperText}>
            This is not your username or pin. This name will be visible to your contacts.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111b21',
  },
  continueButton: {
    padding: 4,
  },
  continueText: {
    fontSize: 16,
    color: '#008069',
    fontWeight: '600',
  },
  continueTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111b21',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#667781',
    lineHeight: 20,
  },
  inputGroup: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    color: '#008069',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    fontSize: 17,
    color: '#111b21',
    padding: 0,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#8696a0',
    marginTop: 4,
  },
}); 