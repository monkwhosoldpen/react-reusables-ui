import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { ThemeName, useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { TenantRequest, useAuth } from '~/lib/contexts/AuthContext';
import { FollowButton } from '@/components/common/FollowButton';
import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { indexedDB } from '@/lib/services/indexedDB';
import LanguageChanger from '@/components/common/LanguageChanger';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from '~/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, type Option } from '~/components/ui/select';

interface MainScreenProps {
  initialData?: {
    follows: any[];
    requests: TenantRequest[];
  };
}

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
    backgroundColor: Constants.manifest.splash.backgroundColor,
  },
  contentContainer: {
    padding: 8,
    width: '100%',
    maxWidth: "100%",
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
  channelsList: {
    gap: 8,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontWeight: '500',
  },
  userType: {
    fontSize: 12,
    opacity: 0.7,
  },
  tenantRequestsTable: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  noRequests: {
    textAlign: 'center',
    padding: 16,
  },
  languageChanger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
  },
  label: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginIcon: {
    marginRight: 8,
  },
});

export function MainScreen({ initialData }: MainScreenProps) {
  const { theme } = useTheme();
  const { colorScheme, themeName, updateTheme, isDarkMode, toggleDarkMode } = useColorScheme();
  const { design } = useDesign();
  const { user, signOut, userInfo, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [followedChannels, setFollowedChannels] = useState<any[]>(initialData?.follows || []);
  const [tenantRequests, setTenantRequests] = useState<TenantRequest[]>(initialData?.requests || []);
  const [dbInitialized, setDbInitialized] = useState(false);
  const initializationStarted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleThemeChange = (option: Option) => {
    if (option?.value) {
      updateTheme(option.value as ThemeName);
    }
  };

  // Initialize IndexedDB
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;
      console.log('Initializing IndexedDB on mount');
      
      indexedDB.initialize()
        .then(() => {
          console.log('IndexedDB initialized successfully');
          setDbInitialized(true);
        })
        .catch(err => {
          console.error('Error initializing IndexedDB:', err);
        });
    }
  }, []);

  // Fetch followed channels
  const fetchUserFollows = async () => {
    if (!user?.id || !dbInitialized) return [];
    
    try {
      const follows = await indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id);
      return follows || [];
    } catch (err) {
      console.error('Error fetching user follows:', err);
      return [];
    }
  };

  // Fetch tenant requests
  const fetchTenantRequests = async () => {
    if (!user?.id || !dbInitialized) return [];
    
    try {
      const requests = await indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id);
      return requests || [];
    } catch (err) {
      console.error('Error fetching tenant requests:', err);
      return [];
    }
  };

  // Load data when DB is initialized and user is available
  useEffect(() => {
    const loadData = async () => {
      if (dbInitialized && user?.id && !isDataLoaded) {
        setIsLoading(true);
        try {
          const [follows, requests] = await Promise.all([
            fetchUserFollows(),
            fetchTenantRequests()
          ]);
          setFollowedChannels(follows);
          setTenantRequests(requests);
          setIsDataLoaded(true);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [dbInitialized, user?.id, isDataLoaded]);

  // Reset data loaded state when user changes
  useEffect(() => {
    setIsDataLoaded(false);
  }, [user?.id]);

  const handleStart = useCallback(() => {
    console.log('User:', user);
  }, [user]);

  if (authLoading) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          { 
            backgroundColor: colorScheme.colors.card,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Loading...
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Please wait while we initialize the app.
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          { 
            backgroundColor: colorScheme.colors.card,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Welcome to NChat
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Sign in to access your channels, follow users, and manage your tenant requests.
          </Text>
          <TouchableOpacity
            style={[
              styles.loginButton,
              { 
                backgroundColor: colorScheme.colors.primary,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
            onPress={() => router.push('/login')}
          >
            <LogIn 
              size={20} 
              color={colorScheme.colors.background} 
              style={styles.loginIcon}
            />
            <Text style={[styles.loginButtonText, { color: colorScheme.colors.background }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loginContainer, { backgroundColor: colorScheme.colors.background }]}>
        <View style={[
          styles.loginCard,
          { 
            backgroundColor: colorScheme.colors.card,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }
        ]}>
          <Text style={[styles.loginTitle, { color: colorScheme.colors.text }]}>
            Loading...
          </Text>
          <Text style={[styles.loginDescription, { color: colorScheme.colors.text }]}>
            Please wait while we load your data.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.mainContainer, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: insets.bottom + Number(design.spacing.padding.card),
          paddingTop: Number(design.spacing.padding.card)
        }
      ]}
    >
      {/* Followed Channels Section - First */}
      <View style={[
        styles.card,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <Text style={[
          styles.sectionTitle,
          {
            color: colorScheme.colors.text,
            fontSize: Number(design.spacing.fontSize.sm),
            marginBottom: Number(design.spacing.margin.card)
          }
        ]}>
          Followed Channels
        </Text>
        <View style={styles.channelsList}>
          {followedChannels.length > 0 ? (
            followedChannels.map((channel: any, index: number) => (
              <TouchableOpacity
                key={`channel-${channel.username || 'unknown'}-${index}`}
                style={[styles.channelItem, {
                  borderColor: colorScheme.colors.border,
                  backgroundColor: colorScheme.colors.background,
                  padding: Number(design.spacing.padding.item),
                  borderRadius: Number(design.radius.md)
                }]}
                onPress={() => router.push(`/${channel.username}` as any)}
              >
                <View style={styles.channelInfo}>
                  <View style={[styles.avatar, { backgroundColor: colorScheme.colors.primary }]}>
                    <Text style={{ color: colorScheme.colors.background }}>
                      {channel.username[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.username, { color: colorScheme.colors.text }]}>
                      @{channel.username}
                    </Text>
                    <Text style={[styles.userType, { color: colorScheme.colors.text }]}>
                      {channel.type || 'Channel'}
                    </Text>
                  </View>
                </View>
                <FollowButton username={channel.username} showIcon />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noRequests, { color: colorScheme.colors.text }]}>
              No followed channels
            </Text>
          )}
        </View>
      </View>

      {/* Tenant Requests Section - Second */}
      <View style={[
        styles.card,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <Text style={[
          styles.sectionTitle,
          {
            color: colorScheme.colors.text,
            fontSize: Number(design.spacing.fontSize.sm),
            marginBottom: Number(design.spacing.margin.card)
          }
        ]}>
          Tenant Requests
        </Text>
        {tenantRequests.length > 0 ? (
          <View style={styles.channelsList}>
            {tenantRequests.map((request: TenantRequest, index: number) => (
              <TouchableOpacity
                key={`request-${request.username || 'unknown'}-${index}`}
                style={[styles.channelItem, {
                  borderColor: colorScheme.colors.border,
                  backgroundColor: colorScheme.colors.background,
                  padding: Number(design.spacing.padding.item),
                  borderRadius: Number(design.radius.md)
                }]}
                onPress={() => router.push(`/${request.username}` as any)}
              >
                <View style={styles.channelInfo}>
                  <View style={[styles.avatar, { backgroundColor: colorScheme.colors.primary }]}>
                    <Text style={{ color: colorScheme.colors.background }}>
                      {request.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.username, { color: colorScheme.colors.text }]}>
                      @{request.username}
                    </Text>
                    <Text style={[styles.userType, { color: colorScheme.colors.text }]}>
                      {request.type} - {request.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[styles.noRequests, { color: colorScheme.colors.text }]}>
            No tenant requests
          </Text>
        )}
      </View>

      {/* Elon Musk Follow Button - Third */}
      <View style={[
        styles.followSection,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <Text style={[styles.followText, { color: colorScheme.colors.text }]}>
          Follow Elon Musk
        </Text>
        <FollowButton username="elonmusk" showIcon />
      </View>

      {/* Theme Selector Section */}
      <View style={[
        styles.card,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <Text style={[
          styles.sectionTitle,
          {
            color: colorScheme.colors.text,
            fontSize: Number(design.spacing.fontSize.sm),
            marginBottom: Number(design.spacing.margin.card)
          }
        ]}>
          Appearance
        </Text>

        <View style={[styles.settingRow, { borderBottomColor: colorScheme.colors.border }]}>
          <View>
            <Text style={[styles.settingTitle, { color: colorScheme.colors.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Use dark theme
            </Text>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingTitle, { color: colorScheme.colors.text }]}>
              Theme
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme.colors.text }]}>
              Choose your preferred style
            </Text>
          </View>
          <Select
            defaultValue={{ value: themeName, label: themeName }}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp" label="WhatsApp" />
              <SelectItem value="dracula" label="Dracula" />
              <SelectItem value="twitter" label="Twitter" />
              <SelectItem value="facebook" label="Facebook" />
            </SelectContent>
          </Select>
        </View>
      </View>

      {/* Language Changer - Above Sign Out */}
      <View style={[
        styles.card,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <LanguageChanger />
      </View>

      {/* Sign Out Section - Last */}
      <View style={[
        styles.card,
        {
          backgroundColor: colorScheme.colors.card,
          padding: Number(design.spacing.padding.card),
          borderRadius: Number(design.radius.lg)
        }
      ]}>
        <TouchableOpacity
          style={[styles.settingsItem, {
            backgroundColor: colorScheme.colors.background,
            borderBottomColor: colorScheme.colors.border,
            padding: Number(design.spacing.padding.item),
            borderRadius: Number(design.radius.md)
          }]}
          onPress={signOut}
        >
          <View style={styles.settingsItemContent}>
            <LogOut size={20} color={colorScheme.colors.text} />
            <Text style={[styles.settingsItemTitle, { color: colorScheme.colors.text }]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

