
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'multiselect' | 'file' | 'date' | 'number' | 'boolean' | 'textarea';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  accept?: string;
  conditional?: string;
}

export interface FormSection {
  fields: FormField[];
}

export interface OnboardingScreen {
  name: string;
  slug: string;
  label: string;
  description: string;
  form: FormSection;
}

export interface WelcomeScreen {
  hero: string;
  ctaText: string;
  welcomeImage: string;
  welcomeText: string;
}

export interface FinishScreen {
  ctaUrl: string;
  finishImage: string;
  finishText: string;
}

export interface OnboardingConfig {
  welcomescreen: WelcomeScreen;
  screens: OnboardingScreen[];
  finishscreen: FinishScreen;
}

// Mock configuration matching the provided structure
export const MOCK_ONBOARDING_CONFIG: OnboardingConfig = {
  welcomescreen: {
    hero: "Welcome to Your Enterprise Workspace",
    ctaText: "Get Started",
    welcomeText: "Set up your workspace and start collaborating with your team.",
    welcomeImage: "https://storage.googleapis.com/goat-assets/enterprise-welcome.jpg"
  },
  screens: [
    {
      name: "userDetails",
      slug: "personal-information",
      label: "Personal Information",
      description: "Please provide your detailed personal information for verification",
      form: {
        fields: [
          {
            name: "firstName",
            type: "text",
            label: "First Name",
            required: true
          },
          {
            name: "lastName",
            type: "text",
            label: "Last Name",
            required: true
          },
          {
            name: "dateOfBirth",
            type: "date",
            label: "Date of Birth",
            required: true
          },
          {
            name: "gender",
            type: "select",
            label: "Gender",
            options: ["Male", "Female", "Non-binary", "Prefer not to say"],
            required: true
          },
          {
            name: "primaryEmail",
            type: "email",
            label: "Primary Email",
            required: true
          },
          {
            name: "phoneNumber",
            type: "tel",
            label: "Primary Phone Number",
            required: true
          }
        ]
      }
    },
    {
      name: "organizationBasics",
      slug: "org-basics",
      label: "Organization Basics",
      description: "Set up your organization's fundamental information",
      form: {
        fields: [
          {
            name: "orgName",
            type: "text",
            label: "Organization Name",
            required: true
          },
          {
            name: "legalName",
            type: "text",
            label: "Legal Business Name",
            required: true
          },
          {
            name: "taxId",
            type: "text",
            label: "Tax ID/EIN",
            required: true
          },
          {
            name: "orgType",
            type: "select",
            label: "Organization Type",
            options: [
              "Corporation",
              "LLC",
              "Partnership",
              "Sole Proprietorship",
              "Non-Profit"
            ],
            required: true
          }
        ]
      }
    },
    {
      name: "personalPreferences",
      slug: "hobbies-interests",
      label: "Hobbies & Interests",
      description: "Tell us about your interests and preferences",
      form: {
        fields: [
          {
            name: "professionalInterests",
            type: "multiselect",
            label: "Professional Interests",
            options: [
              "Artificial Intelligence",
              "Blockchain",
              "Cloud Computing",
              "Cybersecurity",
              "Data Science",
              "DevOps",
              "Machine Learning",
              "Mobile Development",
              "Web Development",
              "UX/UI Design"
            ],
            required: true
          },
          {
            name: "hobbies",
            type: "multiselect",
            label: "Personal Hobbies",
            options: [
              "Reading",
              "Writing",
              "Gaming",
              "Sports",
              "Music",
              "Art",
              "Photography",
              "Travel",
              "Cooking",
              "Fitness"
            ]
          }
        ]
      }
    }
  ],
  finishscreen: {
    ctaUrl: "/dashboard",
    finishText: "Your workspace is ready! Let's get started.",
    finishImage: "https://storage.googleapis.com/goat-assets/setup-complete.jpg"
  }
}; 