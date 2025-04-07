import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useAuth } from '~/lib/contexts/AuthContext';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  videoContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Dark background similar to video
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginHorizontal: 'auto',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  followSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsItemDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export function MainScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleStart = useCallback(() => {
    console.log('User:', user);
  }, [user]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Hello Universe!</Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
        <View style={styles.followSection}>
          <Text style={styles.followText}>Follow Elon Musk</Text>
          <FollowButton username="elonmusk" showIcon />
        </View>
        
        {/* Account Section */}
        <View style={[styles.card, { backgroundColor: theme.colorScheme.colors.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.colorScheme.colors.text }]}>
            Account
          </Text>
          
          {user ? (
            <TouchableOpacity
              style={[styles.settingsItem, {
                backgroundColor: theme.colorScheme.colors.card,
                borderBottomColor: theme.colorScheme.colors.border,
              }]}
              onPress={signOut}
            >
              <View style={styles.settingsItemContent}>
                <LogOut 
                  size={24} 
                  color={theme.colorScheme.colors.notification} 
                />
                <View style={styles.settingsItemText}>
                  <Text style={[styles.settingsItemTitle, { color: theme.colorScheme.colors.notification }]}>
                    Sign Out
                  </Text>
                  <Text style={[styles.settingsItemDescription, { color: theme.colorScheme.colors.text }]}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.settingsItem, {
                backgroundColor: theme.colorScheme.colors.card,
                borderBottomColor: theme.colorScheme.colors.border,
              }]}
              onPress={() => router.push('/login')}
            >
              <View style={styles.settingsItemContent}>
                <LogIn 
                  size={24} 
                  color={theme.colorScheme.colors.text} 
                />
                <View style={styles.settingsItemText}>
                  <Text style={[styles.settingsItemTitle, { color: theme.colorScheme.colors.text }]}>
                    Sign In
                  </Text>
                  <Text style={[styles.settingsItemDescription, { color: theme.colorScheme.colors.text }]}>
                    Sign in to your account
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

