import { MOCK_ONBOARDING_CONFIG } from "./onboardingConfig";

const janedoe_tenant_supabase_url = 'https://risbemjewosmlvzntjkd.supabase.co';
const janedoe_tenant_supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

export const PREMIUM_CONFIGS: Record<string, any> = {
  elonmusk: {
    tenant_supabase_url: 'https://umaawlnigpjokqiwkeqo.supabase.co',
    tenant_supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWF3bG5pZ3Bqb2txaXdrZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDI4ODAsImV4cCI6MjA1MjQxODg4MH0.HoEfwNovUghm46cQlKZBOk07nhmWPi3VTX-ektew-Ac',
  },
  janedoe: {
    tenant_supabase_url: janedoe_tenant_supabase_url,
    tenant_supabase_anon_key: janedoe_tenant_supabase_anon_key,
    openai_api_key: 'mock-openai-key',
    onesignal_app_id: 'mock-onesignal-id',
    onesignal_api_key: 'mock-onesignal-key',
    donation_enabled: true,
    donors_config: {
      name: "Janedoe",
      logo: "https://placehold.co/150",
      description: "Donate to Janedoe",
      upi: "donor@upi",
      email: "donor@janedoe.com",
    },
    super_admins: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
    is_update_only: true,
    is_premium: true,
    admin_dashboard: {
      chats_groups_config: {
        "broadcast_groups": true,
        "direct_chats": true,
        "bot_only_groups": true,
        "ai_agent_groups": true,
        "support_groups": true,
        "private_groups": true
      },
      messages_config: {
        basic_text_messages: true,
        long_text_messages: true,
        video_messages: true,
        audio_messages: true,
        document_messages: true,
        links_messages: true,
        image_messages: true,
        store_messages: true,
        share_messages: true,
        surveys: true,
        polls: true,
        quizzes: true,
        events: true
      },
      features: {
        USER_MANAGEMENT: true,
        
        BASIC_CHAT: true,
        
        SUPER_FANS_CHAT: true,
        
        ENHANCED_CHAT: true,
        
        AI_DASHBOARD: true,
      }
    },
    related_channels: [
      {
        username: "janedoe_farmers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: true,
        is_premium: true,
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_weather",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: true,
        is_premium: true,
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_superfans",
        owner_username: "janedoe",
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_employees",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_barbers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_youth",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_yoga",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_dancers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_help",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_agent: false,
        is_owner_db: true
      },
      {
        username: "janedoe_1v1",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_agent: true,
        is_owner_db: true
      }
    ],
    store_products: [
      {
        product_id: "product_1",
        product_description: "Product 1 description",
        mrp: 100,
        selling_price: 80,
        image_url: "https://placehold.co/150"
      }
    ],
    store_services: [
      {
        service_id: "service_1",
        service_description: "Service 1 description",
        price: 100
      }
    ]
  }
}; 