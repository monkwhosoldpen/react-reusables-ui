import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useAuth } from '~/lib/contexts/AuthContext';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('Failed to prevent splash screen auto hide:', error);
});

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

export function SplashVideo({ onLoaded, onFinish }: { onLoaded: () => void, onFinish: () => void }) {
  const video = useRef<Video>(null);
  const [lastStatus, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  console.log('SplashVideo: Rendering with width:', width, 'isTablet:', isTablet);

  useEffect(() => {
    const startPlayback = async () => {
      if (video.current) {
        try {
          await video.current.playAsync();
          console.log('Video playback started');
        } catch (error) {
          console.error('Failed to start video playback:', error);
          setPlaybackError(error instanceof Error ? error.message : String(error));
          // If autoplay fails, we'll still proceed with the app
          onLoaded();
        }
      }
    };

    if (lastStatus.isLoaded) {
      startPlayback();
    }
  }, [lastStatus.isLoaded, onLoaded]);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    console.log('Video playback status update:', status);
    
    if (isInitialLoad && !hasLoaded) {
      console.log('Video loaded, calling onLoaded');
      setIsInitialLoad(false);
      setHasLoaded(true);
      onLoaded();
    }

    if (status.didJustFinish) {
      console.log('Video finished, calling onFinish');
      onFinish();
    }

    setStatus(status);
  }, [isInitialLoad, hasLoaded, onLoaded, onFinish]);

  const videoSource = useMemo(() => (
    isTablet
      ? require("../assets/splash-tablet.mp4")
      : require("../assets/splash.mp4")
  ), [isTablet]);

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={video}
          style={styles.video}
          source={videoSource}
          shouldPlay={true}
          isLooping={false}
          resizeMode={ResizeMode.COVER}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error: string) => {
            console.error('Video playback error:', error);
            setPlaybackError(error);
            // If video fails to load, we'll still proceed with the app
            onLoaded();
          }}
        />
      </View>
      {playbackError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Video playback failed. Proceeding with app...
          </Text>
        </View>
      )}
    </View>
  );
}

function MainScreen() {
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

function AnimatedSplashScreen({ children }: { children: React.ReactNode }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashVideoComplete, setSplashVideoComplete] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAppReady && isSplashVideoComplete) {
      console.log('Starting splash screen fade out animation');
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        console.log('Splash screen animation complete');
        setAnimationComplete(true);
      });
    }
  }, [isAppReady, isSplashVideoComplete, animation]);

  const onImageLoaded = useCallback(async () => {
    try {
      console.log('Hiding splash screen');
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      console.error('Error during splash screen initialization:', e);
    } finally {
      console.log('Setting app ready state');
      setAppReady(true);
    }
  }, []);

  const videoElement = useMemo(() => {
    return (
      <SplashVideo
        onLoaded={onImageLoaded}
        onFinish={() => {
          console.log('Splash video finished');
          setSplashVideoComplete(true);
        }}
      />
    );
  }, [onImageLoaded]);

  // On web, skip the splash screen and show main content directly
  if (Platform.OS === 'web') {
    return <MainScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest.splash.backgroundColor,
              opacity: animation,
              pointerEvents: 'none',
            },
          ]}
        >
          {videoElement}
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <AnimatedSplashScreen>
      <MainScreen />
    </AnimatedSplashScreen>
  );
}
