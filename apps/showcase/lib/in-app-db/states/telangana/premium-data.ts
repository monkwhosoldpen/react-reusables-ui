import { MOCK_ONBOARDING_CONFIG } from "./onboardingConfig";

const janedoe_tenant_supabase_url = 'https://risbemjewosmlvzntjkd.supabase.co';
const janedoe_tenant_supabase_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM';

export const PREMIUM_CONFIGS: Record<string, any> = {
  elonmusk: {},
  janedoe: {
    tenant_supabase_url: janedoe_tenant_supabase_url,
    tenant_supabase_anon_key: janedoe_tenant_supabase_anon_key,
    openai_api_key: 'mock-openai-key',
    onesignal_app_id: 'mock-onesignal-id',
    onesignal_api_key: 'mock-onesignal-key',
    roles: {
      super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
      viewer: ['viewer1@janedoe.com', 'viewer2@janedoe.com'],
      verifier: ['verifier1@janedoe.com'],
      onboarder: ['onboarder1@janedoe.com']
    },
    client_type: 'basic',
    related_channels: [
      {
        username: "janedoe_farmers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        is_update_only: true,
        is_premium: true,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_weather",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_superfans",
        owner_username: "janedoe",
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_employees",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_barbers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_youth",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_yoga",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_dancers",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_help",
        owner_username: "janedoe",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
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
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe.com'],
          onboarder: ['onboarder1@janedoe.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_agent: true,
        is_owner_db: true
      }
    ],
  },
  janedoe_pro: {
    tenant_supabase_url: janedoe_tenant_supabase_url,
    tenant_supabase_anon_key: janedoe_tenant_supabase_anon_key,
    openai_api_key: 'mock-openai-key',
    onesignal_app_id: 'mock-onesignal-id',
    onesignal_api_key: 'mock-onesignal-key',
    donors_config: {
      name: "Janedoe",
      logo: "https://placehold.co/150",
      description: "Donate to Janedoe",
      upi: "donor@upi",
      email: "donor@janedoe.com",
    },
    roles: {
      super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
      viewer: ['viewer1@janedoe_pro.com', 'viewer2@janedoe_pro.com'],
      verifier: ['verifier1@janedoe_pro.com'],
      onboarder: ['onboarder1@janedoe_pro.com']
    },
    client_type: 'pro',
    related_channels: [
      {
        username: "janedoe_pro_farmers",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_weather",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: true,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_superfans",
        owner_username: "janedoe_pro",
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_employees",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: true,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_barbers",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_youth",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_yoga",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_dancers",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_help",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
        is_update_only: false,
        is_premium: true,
        is_public: false,
        is_agent: false,
        is_owner_db: true
      },
      {
        username: "janedoe_pro_1v1",
        owner_username: "janedoe_pro",
        onboardingConfig: MOCK_ONBOARDING_CONFIG,
        roles: {
          super_admin: ['monkwhosoldpen@gmail.com', 'superadmin@janedoe_pro.com'],
          viewer: ['viewer1@janedoe_pro.com'],
          verifier: ['verifier1@janedoe_pro.com'],
          onboarder: ['onboarder1@janedoe_pro.com']
        },
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