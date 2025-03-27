import { MediaItem } from '../types/superfeed';

export interface RequestAccessField {
  type: 'text' | 'email' | 'phone' | 'image' | 'select' | 'multiselect';
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  };
}

export interface RequestAccessSection {
  title: string;
  fields: RequestAccessField[];
}

export interface RequestAccessConfig {
  sections: RequestAccessSection[];
  terms: {
    title: string;
    content: string;
  };
  metadata?: {
    allowPrefill?: boolean;
    requireAuth?: boolean;
    autoApprove?: boolean;
  };
}

export const MOCK_REQUEST_ACCESS_CONFIG: RequestAccessConfig = {
  sections: [
    {
      title: "Contact Details",
      fields: [
        {
          type: "text",
          name: "username",
          label: "Username",
          required: true,
          validation: {
            minLength: 3,
            maxLength: 30
          }
        },
        {
          type: "text",
          name: "name",
          label: "Full Name",
          required: true,
          validation: {
            minLength: 2,
            maxLength: 50
          }
        },
        {
          type: "phone",
          name: "phone",
          label: "Phone Number",
          required: true,
          validation: {
            pattern: "^[0-9]{10}$"
          }
        },
        {
          type: "phone",
          name: "whatsapp",
          label: "WhatsApp Number (Optional)",
          required: false,
          validation: {
            pattern: "^[0-9]{10}$"
          }
        }
      ]
    },
    {
      title: "Address Details",
      fields: [
        {
          type: "text",
          name: "address",
          label: "Address",
          required: true,
          validation: {
            minLength: 5,
            maxLength: 200
          }
        },
        {
          type: "text",
          name: "city",
          label: "City",
          required: true
        },
        {
          type: "text",
          name: "state",
          label: "State",
          required: true
        },
        {
          type: "text",
          name: "country",
          label: "Country",
          required: true
        },
        {
          type: "text",
          name: "pincode",
          label: "Pincode",
          required: true,
          validation: {
            pattern: "^[0-9]{6}$"
          }
        }
      ]
    },
    {
      title: "Professional Details",
      fields: [
        {
          type: "text",
          name: "occupation",
          label: "Occupation",
          required: true
        },
        {
          type: "text",
          name: "company",
          label: "Company/Organization",
          required: true
        },
        {
          type: "text",
          name: "designation",
          label: "Designation (Optional)",
          required: false
        },
        {
          type: "text",
          name: "experience",
          label: "Years of Experience (Optional)",
          required: false,
          validation: {
            pattern: "^[0-9]{1,2}$"
          }
        }
      ]
    },
    {
      title: "Upload Images",
      fields: [
        {
          type: "image",
          name: "displayImage",
          label: "Upload Display Picture",
          required: true
        },
        {
          type: "image",
          name: "addressProofImage",
          label: "Upload Address Proof",
          required: true
        }
      ]
    },
    {
      title: "Interests & Hobbies",
      fields: [
        {
          type: "multiselect",
          name: "interests",
          label: "Select Your Interests",
          required: true,
          options: [
            'Technology', 'Sports', 'Music', 'Art', 'Travel', 
            'Food', 'Fashion', 'Gaming', 'Reading', 'Movies'
          ]
        },
        {
          type: "multiselect",
          name: "hobbies",
          label: "Select Your Hobbies",
          required: true,
          options: [
            'Photography', 'Cooking', 'Dancing', 'Writing', 'Gardening',
            'Yoga', 'Painting', 'Swimming', 'Hiking', 'Cycling'
          ]
        }
      ]
    }
  ],
  terms: {
    title: "Terms and Conditions",
    content: "By accepting these terms, you agree to our privacy policy and terms of service. This is a mock terms and conditions text for demonstration purposes."
  },
  metadata: {
    allowPrefill: true,
    requireAuth: true,
    autoApprove: false
  }
}; 