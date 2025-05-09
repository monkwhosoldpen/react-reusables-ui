import { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from "@expo/vector-icons";

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  relatedApps: any[];
  prompt(): Promise<void>;
}

interface AppInstalledEvent extends Event {
  platform?: string;
  relatedApps?: any[];
}

export function PWADebug() {
  const { colorScheme } = useColorScheme();
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swStatus, setSwStatus] = useState<'active' | 'waiting' | 'redundant' | 'none'>('none');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, type, message }]);
    
    // Add console logs with appropriate styling
    switch (type) {
      case 'error':
        console.error(`[PWA Debug] ${message}`);
        break;
      case 'warning':
        console.warn(`[PWA Debug] ${message}`);
        break;
      case 'success':
        console.log(`%c[PWA Debug] ${message}`, 'color: green');
        break;
      default:
        console.log(`[PWA Debug] ${message}`);
    }
  };

  useEffect(() => {
    console.log('[PWA Debug] Initializing PWA debug component');
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      addLog('success', 'PWA is running in standalone mode');
      console.log('[PWA Debug] Running in standalone mode');
    }

    // Check service worker status
    if ('serviceWorker' in navigator) {
      console.log('[PWA Debug] Service Workers are supported');
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          const status = registration.active ? 'active' : 'waiting';
          setSwStatus(status);
          addLog('info', `Service Worker status: ${status}`);
          console.log('[PWA Debug] Service Worker registration:', {
            scope: registration.scope,
            active: registration.active ? {
              state: registration.active.state,
              scriptURL: registration.active.scriptURL
            } : null
          });
        } else {
          addLog('warning', 'No Service Worker registration found');
          console.warn('[PWA Debug] No Service Worker registration found');
        }
      }).catch(error => {
        addLog('error', `Service Worker error: ${error.message}`);
        console.error('[PWA Debug] Service Worker error:', error);
      });
    } else {
      addLog('error', 'Service Workers not supported in this browser');
      console.error('[PWA Debug] Service Workers not supported');
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      const event = e as BeforeInstallPromptEvent;
      console.log('[PWA Debug] Installation prompt available');
      addLog('info', 'PWA installation prompt available');
      
      // Log the event details
      console.log('[PWA Debug] BeforeInstallPrompt event:', {
        platforms: event.platforms,
        userChoice: event.userChoice,
        relatedApps: event.relatedApps
      });
      
      e.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', (e) => {
      const event = e as AppInstalledEvent;
      console.log('[PWA Debug] PWA successfully installed');
      addLog('success', 'PWA successfully installed');
      
      // Log installation details
      console.log('[PWA Debug] AppInstalled event:', {
        platform: event.platform,
        relatedApps: event.relatedApps
      });
      
      setIsInstalled(true);
      setIsInstallable(false);
    });

    // Log initial PWA status
    addLog('info', `Initial PWA status: ${isInstalled ? 'Installed' : 'Not Installed'}`);
    addLog('info', `Display mode: ${window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}`);
    console.log('[PWA Debug] Initial status:', {
      isInstalled,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser',
      isInstallable,
      hasDeferredPrompt: !!deferredPrompt
    });

    return () => {
      console.log('[PWA Debug] Cleaning up event listeners');
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      addLog('warning', 'Install prompt not available');
      console.log('[PWA Debug] Install prompt not available');
      return;
    }

    try {
      console.log('[PWA Debug] Showing installation prompt');
      addLog('info', 'Showing installation prompt');
      
      // Log the prompt details
      console.log('[PWA Debug] Install prompt details:', {
        platform: (deferredPrompt as BeforeInstallPromptEvent).platforms,
        relatedApps: (deferredPrompt as BeforeInstallPromptEvent).relatedApps,
        userChoice: (deferredPrompt as BeforeInstallPromptEvent).userChoice
      });
      
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA Debug] Installation prompt outcome:', outcome);

      // We no longer need the prompt. Clear it up
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        addLog('success', 'User accepted the installation prompt');
        console.log('[PWA Debug] User accepted installation');
      } else {
        addLog('warning', 'User dismissed the installation prompt');
        console.log('[PWA Debug] User dismissed installation');
      }
    } catch (error) {
      console.error('[PWA Debug] Installation error:', error);
      addLog('error', `Installation error: ${error.message}`);
    }
  };

  if (Platform.OS !== 'web') {
    console.log('[PWA Debug] Not running on web platform');
    return null;
  }

  return (
    <View className="p-4">
      {/* PWA Installation Section */}
      <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Install App
          </Text>
          {isInstalled && (
            <View className="flex-row items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <MaterialIcons name="check-circle" size={16} color="#22c55e" />
              <Text className="ml-1 text-sm text-green-700 dark:text-green-300">
                Installed
              </Text>
            </View>
          )}
        </View>

        {isInstallable && !isInstalled ? (
          <View>
            <Text className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Install this app on your device for quick and easy access when you're on the go.
            </Text>
            <Pressable
              onPress={handleInstall}
              className="flex-row items-center justify-center bg-blue-500 px-6 py-3 rounded-lg"
            >
              <MaterialIcons name="add-to-home-screen" size={24} color="#FFFFFF" />
              <Text className="text-white font-medium text-lg ml-2">
                Add to Home Screen
              </Text>
            </Pressable>
          </View>
        ) : !isInstalled ? (
          <View>
            <Text className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              To install this app:
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center">
                <MaterialIcons name="check-circle" size={16} color="#3b82f6" />
                <Text className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                  Use Chrome or Edge browser
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="check-circle" size={16} color="#3b82f6" />
                <Text className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                  Visit this site multiple times
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="check-circle" size={16} color="#3b82f6" />
                <Text className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                  Look for the install icon in the address bar
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-sm text-blue-800 dark:text-blue-200">
            This app is installed and ready to use. You can launch it from your home screen.
          </Text>
        )}
      </View>

      {/* Service Worker Status */}
      <View className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <MaterialIcons 
              name={swStatus === 'active' ? "sync" : "sync-problem"} 
              size={20} 
              color={swStatus === 'active' ? "#22c55e" : "#6b7280"} 
            />
            <Text className="ml-2 text-zinc-700 dark:text-zinc-300">
              Service Worker
            </Text>
          </View>
          <Text className={`text-sm ${
            swStatus === 'active' ? 'text-green-600 dark:text-green-400' :
            swStatus === 'waiting' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {swStatus === 'active' ? 'Active' :
             swStatus === 'waiting' ? 'Waiting' :
             'Not Active'}
          </Text>
        </View>
        
        {swStatus === 'active' && (
          <Text className="text-sm text-zinc-600 dark:text-zinc-400">
            Service worker is active and handling background tasks.
          </Text>
        )}
      </View>

      {/* Debug Logs */}
      <View className="mt-4">
        <Pressable
          onPress={() => {
            console.log('[PWA Debug] Toggling logs visibility');
            setShowLogs(!showLogs);
          }}
          className="flex-row items-center bg-zinc-200 dark:bg-zinc-700 px-3 py-2 rounded-lg mb-2"
        >
          <MaterialIcons 
            name={showLogs ? "visibility-off" : "visibility"} 
            size={20} 
            color={colorScheme === 'dark' ? "#fff" : "#000"} 
          />
          <Text className="ml-2 text-zinc-900 dark:text-zinc-100">
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Text>
        </Pressable>

        {showLogs && (
          <View className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <ScrollView className="max-h-40">
              {logs.map((log, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Text className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">
                    {log.timestamp}
                  </Text>
                  <Text className={`text-xs ${
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'success' ? 'text-green-500' :
                    log.type === 'warning' ? 'text-yellow-500' :
                    'text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {log.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
} 