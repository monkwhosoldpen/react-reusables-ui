import { MediaItem, PollData, QuizData, SurveyData } from './superfeed';
import type { Channel } from '../../core/types/channel.types';

export interface MediaInputProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  maxMedia?: number;
}

export interface PollFormProps {
  data: Partial<PollData> | undefined;
  onChange: (updates: Partial<PollData>) => void;
}

export interface QuizFormProps {
  data: Partial<QuizData> | undefined;
  onChange: (updates: Partial<QuizData>) => void;
}

export interface SurveyFormProps {
  data: Partial<SurveyData> | undefined;
  onChange: (updates: Partial<SurveyData>) => void;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: any;
}

export interface TabBarProps {
  activeTab: any;
  onTabChange: (tab: any) => void;
}

export interface BottomBarProps {
  onSubmit: () => void;
  onFillSample: () => void;
  isSubmitting: boolean;
}

// Base request type for tenant onboarding
export interface TenantOnboardingRequest {
  // Basic Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  
  // Contact Information
  primaryEmail: string;
  secondaryEmail?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  telegramHandle?: string;
  
  // Address Information
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Professional Information
  occupation: string;
  employer?: string;
  yearsOfExperience: number;
  employmentStatus: string;
  
  // Financial Information
  incomeRange: string;
  investmentExperience: string;
  
  // Identity Verification
  idType: string;
  idFront: string;
  idBack: string;
  
  // Address Proof
  addressProofType: string;
  addressProof: string;
  
  // Additional Information
  additionalInfo?: string;
  termsAccepted: boolean;
  dataConsent: boolean;

  // Organization Information
  orgName?: string;
  legalName?: string;
  taxId?: string;
  orgType?: string;
  website?: string;
  description?: string;
  
  // Organization Profile
  industry?: string;
  subIndustries?: string[];
  employeeCount?: number;
  companySize?: string;
  headquarters?: string;
  operatingCountries?: string[];
  
  // Security Settings
  mfaPolicy?: 'optional' | 'required';
  passwordPolicy?: 'Standard' | 'Strong' | 'Very Strong';
  sessionTimeout?: string;
  forcePasswordChange?: boolean;
  
  // Advanced Security
  ipRestriction?: boolean;
  allowedIPs?: string;
  loginAttempts?: string;
  auditLogging?: boolean;
  auditEvents?: string[];
  
  // Communication Settings
  slackIntegration?: boolean;
  slackWebhook?: string;
  teamsIntegration?: boolean;
  teamsWebhook?: string;
  notificationPriority?: string;
  
  // Workflow Integrations
  jiraIntegration?: boolean;
  jiraApiKey?: string;
  jiraDomain?: string;
  githubIntegration?: boolean;
  githubToken?: string;
  gitlabIntegration?: boolean;
  gitlabToken?: string;
  
  // Analytics & Monitoring
  googleAnalytics?: boolean;
  gaTrackingId?: string;
  mixpanel?: boolean;
  mixpanelToken?: string;
  sentry?: boolean;
  sentryDsn?: string;
  
  // Personal Preferences
  professionalInterests: string[];
  hobbies?: string[];
  additionalInterests?: string;
  preferredLearningStyle: string;
}

export interface FormField {
  type: 'text' | 'email' | 'tel' | 'select' | 'multiselect' | 'boolean' | 'file' | 'date' | 'textarea' | 'number';
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  conditional?: string;
  accept?: string;
}

export interface Screen {
  name: string;
  slug: string;
  label: string;
  description: string;
  form: {
    fields: FormField[];
  };
}

export interface OnboardingConfig {
  welcomescreen: {
    hero: string;
    welcomeText: string;
    welcomeImage?: string;
    ctaText?: string;
  };
  screens: Screen[];
  finishscreen: {
    finishRPC: string;
    finishText: string;
    finishImage?: string;
    ctaUrl?: string;
  };
}

export interface TenantTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export interface TenantFeatures {
  ai_assistant: boolean;
  advanced_analytics: boolean;
  custom_workflows: boolean;
  audit_logs: boolean;
}

export interface TenantLimits {
  max_users: number;
  storage_gb: number;
  api_rate_limit: number;
}

export interface TenantCompliance {
  gdpr_enabled: boolean;
  hipaa_enabled: boolean;
  data_retention_days: number;
}

export interface TenantMetadata {
  theme: TenantTheme;
  features: TenantFeatures;
  limits: TenantLimits;
  compliance: TenantCompliance;
}

export interface TenantConfig {
  username: string;
  owner_username: string;
  connection_config: {
    node_private_url: string;
    tenant_supabase_url: string;
    tenant_supabase_anon_key: string;
  };
  openai_api_key: string;
  onesignal_app_id: string;
  onesignal_api_key: string;
  onboarding_config: OnboardingConfig;
  metadata: TenantMetadata;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestAccessFormProps {
  username: string;
  onComplete: () => void;
  onBack: () => void;
} 