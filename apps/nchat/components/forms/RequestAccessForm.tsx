import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { useGlobalSupabase } from '~/lib/hooks/useGlobalSupabase';
import type { 
  TenantConfig, 
  FormField,
  Screen,
  ChannelWithOnboarding,
  RequestAccessFormProps,
  TenantOnboardingRequest 
} from '~/lib/types/forms';

export default function RequestAccessForm({ username, onComplete, onBack }: RequestAccessFormProps) {
  // Core hooks
  const { user } = useAuth();
  const { getTenantConfig, globalSupabase } = useGlobalSupabase();

  // State management
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelWithOnboarding | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'form' | 'finish'>('welcome');
  const [currentFormIndex, setCurrentFormIndex] = useState(0);

  // User details state with proper typing
  const [userDetails, setUserDetails] = useState<Partial<TenantOnboardingRequest>>({
    firstName: user?.user_metadata?.name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
    primaryEmail: user?.email || '',
    phoneNumber: user?.user_metadata?.phone || '',
    whatsappNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: user?.user_metadata?.pincode || '',
    occupation: '',
    employer: '',
    professionalInterests: [],
    hobbies: []
  });

  // Add new state for tenant-specific Supabase client
  const [tenantSupabase, setTenantSupabase] = useState<any>(null);
  const [tenantDetails, setTenantDetails] = useState<any>(null);

  // Change the type from boolean to string status
  const [accessMap, setAccessMap] = useState<Record<string, 'pending' | 'granted' | 'rejected' | 'none'>>({});

  // Add this at the top of the component
  const userId = user?.id;

  // Initialize tenant Supabase client immediately when we have the URL and key
  useEffect(() => {
    if (channel?.tenant_supabase_url && channel?.tenant_supabase_anon_key) {
      console.log('🔑 Initializing tenant Supabase client...');
      const tenantClient = createClient(
        channel.tenant_supabase_url,
        channel.tenant_supabase_anon_key
      );
      setTenantSupabase(tenantClient);
    }
  }, [channel?.tenant_supabase_url, channel?.tenant_supabase_anon_key]);

  // Modify the channel fetch effect to not handle tenant Supabase
  useEffect(() => {
    let mounted = true;

    const fetchChannelAndConfig = async () => {
      if (!username) {
        console.log('🚫 Skipping fetch - missing username:', { username });
        return;
      }
      
      try {
        console.log('🔄 Starting channel fetch for:', { username });
        setIsLoadingConfig(true);
        setConfigError(null);

        console.log('📡 Fetching channel data from global Supabase...');
        const { data: channelData, error: channelError } = await globalSupabase
          .from('channels')
          .select('*')
          .eq('username', username)
          .single();

        if (channelError) {
          console.error('❌ Channel fetch error:', channelError);
          throw new Error(channelError.message || 'Failed to fetch channel data');
        }

        if (!channelData) {
          console.error('❌ No channel data found for:', username);
          throw new Error(`Channel @${username} not found`);
        }

        console.log('✅ Channel data fetched:', {
          username: channelData.username,
          has_tenant_connection: !!(channelData.tenant_supabase_url && channelData.tenant_supabase_anon_key),
          has_onboarding_config: !!channelData.onboarding_config
        });

        setChannel(channelData);
        
        // Set default access status
        setAccessMap({ [username]: 'none' });

      } catch (err: any) {
        console.error('❌ Error in initialization:', err);
        setConfigError(err.message);
      } finally {
        if (mounted) {
          console.log('🏁 Fetch process completed');
          setIsLoadingConfig(false);
        }
      }
    };

    fetchChannelAndConfig();

    return () => {
      mounted = false;
      console.log('🧹 Cleanup: Component unmounted');
    };
  }, [username, globalSupabase]);

  // Add effect to fetch user-specific access data when we have both userId and tenantSupabase
  useEffect(() => {
    if (!userId || !tenantSupabase || !username) return;

    const fetchUserAccess = async () => {
      try {
        console.log('📡 Fetching user-specific access data...');
        const { data: channelsData, error: channelsError } = await tenantSupabase
          .rpc('get_channels_user_id', { p_user_id: userId });

        if (channelsError) {
          console.error('❌ User access data fetch error:', channelsError);
          throw channelsError;
        }

        console.log('✅ User access data fetched:', {
          access_map_size: Object.keys(channelsData?.data?.accessMap || {}).length
        });

        const extractedAccessMap = channelsData?.data?.accessMap || {};
        setAccessMap(extractedAccessMap);
      } catch (err) {
        console.error('❌ Error fetching user access:', err);
      }
    };

    fetchUserAccess();
  }, [userId, tenantSupabase, username]);

  const handleNext = async () => {
    if (currentScreen === 'welcome') {
      setCurrentScreen('form');
    } else if (currentScreen === 'form') {
      // If there's onboarding config, handle multiple screens
      if (channel?.onboarding_config?.screens) {
        if (currentFormIndex < channel.onboarding_config.screens.length - 1) {
          setCurrentFormIndex(prev => prev + 1);
          return;
        }
      }
      // Otherwise, move to finish screen
      setCurrentScreen('finish');
    } else if (currentScreen === 'finish') {
      try {
        if (!channel?.tenant_supabase_url || !channel?.tenant_supabase_anon_key) {
          throw new Error('Missing tenant connection details');
        }

        if (!userId) {
          throw new Error('User ID is required');
        }

        // Prepare RPC parameters
        const rpcParams = {
          p_channel_username: username,
          p_user_id: userId,
          p_user_details: userDetails
        };

        console.log('📡 Calling finish RPC with params:', rpcParams);

        const client = tenantSupabase || createClient(
          channel.tenant_supabase_url,
          channel.tenant_supabase_anon_key
        );

        // Use default RPC if no custom one specified
        const rpcName = channel?.onboarding_config?.finishscreen?.finishRPC || 'request_tenant_channel_access';
        
        const { data: response, error } = await client.rpc(rpcName, rpcParams);

        if (error) {
          console.error('❌ RPC Error:', error);
          throw error;
        }
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to submit access request');
        }

        console.log('✅ Access request submitted successfully');
        onComplete();
      } catch (error) {
        console.error('❌ Error completing onboarding:', error);
        setConfigError(error instanceof Error ? error.message : 'Failed to complete onboarding');
      }
    }
  };

  const handleBack = () => {
    if (currentScreen === 'form' && currentFormIndex > 0) {
      setCurrentFormIndex(prev => prev - 1);
    } else if (currentScreen === 'form' && currentFormIndex === 0) {
      setCurrentScreen('welcome');
    } else {
      onBack();
    }
  };

  const renderFormField = (field: FormField) => {
    const value = userDetails[field.name as keyof typeof userDetails];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={value as string}
              onChangeText={(text) => setUserDetails(prev => ({ ...prev, [field.name]: text }))}
              placeholder={field.placeholder}
              keyboardType={field.type === 'email' ? 'email-address' : field.type === 'tel' ? 'phone-pad' : 'default'}
            />
          </View>
        );
      
      case 'select':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    value === option && styles.selectOptionSelected
                  ]}
                  onPress={() => setUserDetails(prev => ({ ...prev, [field.name]: option }))}
                >
                  <Text style={[
                    styles.selectOptionText,
                    value === option && styles.selectOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'multiselect':
        const selectedValues = (value as string[]) || [];
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    selectedValues.includes(option) && styles.selectOptionSelected
                  ]}
                  onPress={() => {
                    const newValues = selectedValues.includes(option)
                      ? selectedValues.filter(v => v !== option)
                      : [...selectedValues, option];
                    setUserDetails(prev => ({ ...prev, [field.name]: newValues }));
                  }}
                >
                  <Text style={[
                    styles.selectOptionText,
                    selectedValues.includes(option) && styles.selectOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'boolean':
        return (
          <TouchableOpacity
            key={field.name}
            style={styles.checkboxContainer}
            onPress={() => setUserDetails(prev => ({ ...prev, [field.name]: !value }))}
          >
            <View style={[
              styles.checkbox,
              value ? styles.checkboxSelected : undefined
            ]}>
              {value && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const renderWelcomeScreen = () => {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIconContainer}>
          <Ionicons name="key-outline" size={48} color="#008069" />
        </View>
        <Text style={styles.welcomeHero}>
          Request Access to @{username}
        </Text>
        <Text style={styles.welcomeText}>
          {channel?.onboarding_config?.welcomescreen?.welcomeText || 
           "Fill out a quick form to request access to this channel. Once approved, you'll be able to interact with the content."}
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>
            {channel?.onboarding_config?.welcomescreen?.ctaText || 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFinishScreen = () => {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIconContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#008069" />
        </View>
        <Text style={styles.welcomeHero}>Request Submitted!</Text>
        <Text style={styles.welcomeText}>
          {channel?.onboarding_config?.finishscreen?.finishText || 
           "Your access request has been submitted successfully. We'll notify you once it's approved."}
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrentForm = () => {
    // If there's onboarding config, use its screens
    if (channel?.onboarding_config?.screens) {
      const currentScreenConfig = channel.onboarding_config.screens[currentFormIndex];
      if (!currentScreenConfig) return null;

      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{currentScreenConfig.label}</Text>
          <Text style={styles.formDescription}>{currentScreenConfig.description}</Text>
          {currentScreenConfig.form.fields.map((field) => renderFormField(field))}
          <View style={styles.formActions}>
            {currentFormIndex > 0 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>
                {currentFormIndex === (channel.onboarding_config.screens.length - 1) 
                  ? 'Finish'
                  : 'Next'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Default simple form when no onboarding config
    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Basic Information</Text>
        <Text style={styles.formDescription}>Please provide your details to request access.</Text>
        
        {renderFormField({
          type: 'text',
          name: 'firstName',
          label: 'First Name',
          required: true
        })}
        {renderFormField({
          type: 'text',
          name: 'lastName',
          label: 'Last Name',
          required: true
        })}
        {renderFormField({
          type: 'email',
          name: 'primaryEmail',
          label: 'Email',
          required: true
        })}
        {renderFormField({
          type: 'tel',
          name: 'phoneNumber',
          label: 'Phone Number',
          required: true
        })}
        {renderFormField({
          type: 'text',
          name: 'occupation',
          label: 'Occupation',
          required: true
        })}
        
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoadingConfig) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading channel information...</Text>
      </View>
    );
  }

  if (configError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{configError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setIsLoadingConfig(true);
            setConfigError(null);
            getTenantConfig(username);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      {currentScreen === 'welcome' && renderWelcomeScreen()}
      {currentScreen === 'finish' && renderFinishScreen()}
      {currentScreen === 'form' && renderCurrentForm()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#008069',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 24,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 128, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeHero: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#008069',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectOptionSelected: {
    backgroundColor: '#008069',
    borderColor: '#008069',
  },
  selectOptionText: {
    color: '#000',
  },
  selectOptionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#008069',
    borderColor: '#008069',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#008069',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
}); 